-- 012_create_classes.sql — A2.1: classes model + scoped read policies
--
-- Students who enroll in a course always land in that course's **general class**.
-- Instructors run their own classes that students join by code.
--
-- Review notes (Nov 2026), kept here so the next migration author learns from them:
--  1. Foreign keys to people point at public.users, not auth.users. PostgREST can only embed
--     (`select('*, users(name)')`) across keys to exposed tables; migration 005 had to fix the
--     same mistake on courses.instructor_id.
--  2. Every table gets SELECT / INSERT / UPDATE / DELETE covered (migrations/README.md). The first
--     version had SELECT for admins and instructors only: a student could join a class and never
--     read it, and nobody could rename, delete or leave a class.
--  3. Class creation goes through create_regular_class() only. A direct INSERT policy let a client
--     choose any join_code, bypassing the generator and the upper(trim()) normalisation that
--     join_class_by_code() relies on.
--  4. Joining a class also enrols the student in the course. Without that, the lesson page bounced
--     them to "enroll first" and the instructor's enrollment policy never matched them.
--  5. Membership is kept in sync on unenroll too (AFTER DELETE trigger), so an ex-student stops
--     being visible to the instructor.
--  6. An index on every column the policies filter on (the unique index on (class_id, user_id)
--     cannot serve a lookup by user_id alone).
--  7. Functions reachable over /rpc are revoked from PUBLIC and anon explicitly; the helper nobody
--     should call directly (generate_join_code) is revoked from authenticated as well.
--  8. Role checks go through one STABLE SECURITY DEFINER helper, current_user_role(), instead of
--     the same EXISTS subquery pasted into every policy.
--  9. Policies must not read each other's tables in a cycle. A policy on classes that looks at
--     class_members, plus a policy on class_members that looks at classes, fails at query time with
--     "infinite recursion detected in policy" (found by running the migration locally, see
--     supabase/tests/verify_classes_rls.sql). Cross-table checks therefore go through small
--     SECURITY DEFINER helpers (is_class_member, instructs_class, ...), which read without RLS.
--
-- Scope note for the reviewer: the policies below let the instructor of a COURSE see the members of
-- that course's general class (the `is_general AND courses.instructor_id = auth.uid()` branches).
-- The A2.1 card's strict wording is "only students in classes where classes.instructor_id =
-- auth.uid()". Those branches are marked "course-owner visibility" and can be removed as one block
-- if the strict reading is chosen; PR 97's dashboard then needs to read through classes instead.

-- ---------------------------------------------------------------------------------------------
-- STEP 1. Tables
-- ---------------------------------------------------------------------------------------------
CREATE TABLE classes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    -- "the person who runs this class"; NULL for the general class, which belongs to the platform
    instructor_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    join_code TEXT,
    is_general BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT classes_join_code_unique UNIQUE (join_code),
    -- a general class has no owner and no code; a regular class always has a code
    CONSTRAINT class_ownership_and_code_check CHECK (
        (is_general AND instructor_id IS NULL AND join_code IS NULL)
        OR
        (NOT is_general AND join_code IS NOT NULL)
    )
);

CREATE TABLE class_members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (class_id, user_id)
);

-- STEP 2. Each course gets exactly one general class
CREATE UNIQUE INDEX one_general_class_per_course ON classes (course_id) WHERE is_general = true;

-- Indexes for the columns the policies filter on
CREATE INDEX idx_classes_course ON classes(course_id);
CREATE INDEX idx_classes_instructor ON classes(instructor_id);
CREATE INDEX idx_class_members_user ON class_members(user_id);

-- ---------------------------------------------------------------------------------------------
-- STEP 3. Helpers
-- ---------------------------------------------------------------------------------------------

-- The caller's application role ('student' | 'instructor' | 'admin'), or NULL when signed out.
-- SECURITY DEFINER so it works regardless of the policies on public.users; it only ever reads
-- the caller's own row.
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT role FROM public.users WHERE id = auth.uid();
$$;
REVOKE ALL ON FUNCTION public.current_user_role() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.current_user_role() TO authenticated;

-- Cross-table checks used by the policies (review note 9). SECURITY DEFINER: they read the
-- tables without RLS, so a policy can call them without re-entering another policy. Each one
-- only ever answers a yes/no question about the caller.

-- The caller is a member of the class.
CREATE OR REPLACE FUNCTION public.is_class_member(p_class_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.class_members
        WHERE class_id = p_class_id AND user_id = auth.uid()
    );
$$;

-- The class is a general class.
CREATE OR REPLACE FUNCTION public.class_is_general(p_class_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
    SELECT EXISTS (SELECT 1 FROM public.classes WHERE id = p_class_id AND is_general);
$$;

-- The caller instructs the class: they run it, or — course-owner visibility, see the scope note
-- at the top — it is the general class of a course they own.
CREATE OR REPLACE FUNCTION public.instructs_class(p_class_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.classes c
        WHERE c.id = p_class_id
          AND (
              c.instructor_id = auth.uid()
              OR (c.is_general AND EXISTS (
                  SELECT 1 FROM public.courses co
                  WHERE co.id = c.course_id AND co.instructor_id = auth.uid()
              ))
          )
    );
$$;

-- The caller instructs a class, in the given course, that the student belongs to.
CREATE OR REPLACE FUNCTION public.instructs_student_in_course(p_student_id UUID, p_course_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.class_members cm
        JOIN public.classes c ON c.id = cm.class_id
        WHERE cm.user_id = p_student_id
          AND c.course_id = p_course_id
          AND (
              c.instructor_id = auth.uid()
              OR (c.is_general AND EXISTS (   -- course-owner visibility (see scope note)
                  SELECT 1 FROM public.courses co
                  WHERE co.id = c.course_id AND co.instructor_id = auth.uid()
              ))
          )
    );
$$;

REVOKE ALL ON FUNCTION public.is_class_member(UUID), public.class_is_general(UUID),
    public.instructs_class(UUID), public.instructs_student_in_course(UUID, UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_class_member(UUID), public.class_is_general(UUID),
    public.instructs_class(UUID), public.instructs_student_in_course(UUID, UUID) TO authenticated;

-- General class is created with the course
CREATE OR REPLACE FUNCTION public.create_general_class()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO classes (course_id, name, is_general)
    VALUES (NEW.id, 'General Class', true)
    ON CONFLICT (course_id) WHERE is_general = true DO NOTHING;
    RETURN NEW;
END;
$$;

-- Enrollment auto-adds membership of the course's general class
CREATE OR REPLACE FUNCTION public.add_enrollment_to_general_class()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
    general_class_id UUID;
BEGIN
    -- An auth user without a public.users profile cannot be a member (FK); never block the
    -- enrollment itself over that.
    IF NOT EXISTS (SELECT 1 FROM public.users WHERE id = NEW.user_id) THEN
        RETURN NEW;
    END IF;

    SELECT id INTO general_class_id
    FROM public.classes
    WHERE course_id = NEW.course_id AND is_general = true;

    IF general_class_id IS NULL THEN
        INSERT INTO public.classes (course_id, name, is_general)
        VALUES (NEW.course_id, 'General Class', true)
        ON CONFLICT (course_id) WHERE is_general = true DO NOTHING
        RETURNING id INTO general_class_id;

        -- Another transaction may have created it first.
        IF general_class_id IS NULL THEN
            SELECT id INTO general_class_id
            FROM public.classes
            WHERE course_id = NEW.course_id AND is_general = true;
        END IF;
    END IF;

    IF general_class_id IS NULL THEN
        RAISE EXCEPTION 'Unable to find or create general class for course %', NEW.course_id;
    END IF;

    INSERT INTO public.class_members (class_id, user_id)
    VALUES (general_class_id, NEW.user_id)
    ON CONFLICT (class_id, user_id) DO NOTHING;

    RETURN NEW;
END;
$$;

-- Unenrolling removes the general-class membership again (review note 5)
CREATE OR REPLACE FUNCTION public.remove_enrollment_from_general_class()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
    DELETE FROM public.class_members cm
    USING public.classes c
    WHERE c.id = cm.class_id
      AND c.course_id = OLD.course_id
      AND c.is_general = true
      AND cm.user_id = OLD.user_id;
    RETURN OLD;
END;
$$;

-- Join-code generator: 6 chars, no look-alike characters. SECURITY DEFINER so the uniqueness
-- check sees every class, not just the rows the caller may read (review note 7). Internal only.
CREATE OR REPLACE FUNCTION public.generate_join_code()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    alphabet TEXT := 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
    code TEXT;
BEGIN
    LOOP
        code := '';
        FOR i IN 1..6 LOOP
            code := code || substr(alphabet, 1 + floor(random() * length(alphabet))::int, 1);
        END LOOP;
        IF NOT EXISTS (SELECT 1 FROM public.classes WHERE join_code = code) THEN
            RETURN code;
        END IF;
    END LOOP;
END;
$$;
REVOKE ALL ON FUNCTION public.generate_join_code() FROM PUBLIC, anon, authenticated;

-- Create a regular, instructor-run class. The ONLY way a class is created (review note 3):
-- the caller becomes its instructor, must own the course (admins may create for any course),
-- and the code always comes from the generator.
CREATE OR REPLACE FUNCTION public.create_regular_class(
    p_course_id UUID,
    p_name TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    caller UUID := auth.uid();
    caller_role TEXT;
    new_class_id UUID;
    failed_constraint TEXT;
BEGIN
    IF caller IS NULL THEN
        RAISE EXCEPTION 'You must be logged in to create a class';
    END IF;
    SELECT role INTO caller_role FROM public.users WHERE id = caller;
    IF caller_role NOT IN ('instructor', 'admin') THEN
        RAISE EXCEPTION 'Only instructors can create classes';
    END IF;
    IF caller_role = 'instructor' AND NOT EXISTS (
        SELECT 1 FROM public.courses WHERE id = p_course_id AND instructor_id = caller
    ) THEN
        RAISE EXCEPTION 'You can only create classes for your own courses';
    END IF;
    IF p_name IS NULL OR length(trim(p_name)) = 0 THEN
        RAISE EXCEPTION 'A class needs a name';
    END IF;

    LOOP
        BEGIN
            INSERT INTO public.classes (course_id, instructor_id, name, join_code, is_general)
            VALUES (p_course_id, caller, trim(p_name), public.generate_join_code(), false)
            RETURNING id INTO new_class_id;
            RETURN new_class_id;
        EXCEPTION WHEN unique_violation THEN
            GET STACKED DIAGNOSTICS failed_constraint = CONSTRAINT_NAME;
            -- Retry only if the join code collided.
            IF failed_constraint <> 'classes_join_code_unique' THEN
                RAISE;
            END IF;
        END;
    END LOOP;
END;
$$;
REVOKE ALL ON FUNCTION public.create_regular_class(UUID, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.create_regular_class(UUID, TEXT) TO authenticated;

-- Join a class by code. Also enrols the caller in the class's course (review note 4), which
-- lands them in the general class through the trigger above.
CREATE OR REPLACE FUNCTION public.join_class_by_code(
    p_join_code TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    caller UUID := auth.uid();
    target public.classes%ROWTYPE;
BEGIN
    IF caller IS NULL THEN
        RAISE EXCEPTION 'You must be logged in to join a class';
    END IF;

    SELECT * INTO target
    FROM public.classes
    WHERE join_code = upper(trim(p_join_code))
      AND is_general = false;

    IF target.id IS NULL THEN
        RAISE EXCEPTION 'Invalid class join code';
    END IF;
    IF target.instructor_id = caller THEN
        RAISE EXCEPTION 'You run this class';
    END IF;

    INSERT INTO public.enrollments (user_id, course_id)
    VALUES (caller, target.course_id)
    ON CONFLICT (user_id, course_id) DO NOTHING;

    INSERT INTO public.class_members (class_id, user_id)
    VALUES (target.id, caller)
    ON CONFLICT (class_id, user_id) DO NOTHING;

    RETURN target.id;
END;
$$;
REVOKE ALL ON FUNCTION public.join_class_by_code(TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.join_class_by_code(TEXT) TO authenticated;

-- ---------------------------------------------------------------------------------------------
-- STEP 4. Backfill existing courses and enrollments
-- ---------------------------------------------------------------------------------------------
INSERT INTO public.classes (course_id, name, is_general)
SELECT c.id, 'General Class', true
FROM public.courses AS c
WHERE NOT EXISTS (
    SELECT 1 FROM public.classes AS cl WHERE cl.course_id = c.id AND cl.is_general = true
)
ON CONFLICT (course_id) WHERE is_general = true DO NOTHING;

INSERT INTO public.class_members (class_id, user_id)
SELECT cl.id, e.user_id
FROM public.enrollments AS e
JOIN public.classes AS cl ON cl.course_id = e.course_id AND cl.is_general = true
JOIN public.users AS u ON u.id = e.user_id          -- only users with a profile row (FK)
ON CONFLICT (class_id, user_id) DO NOTHING;

-- ---------------------------------------------------------------------------------------------
-- STEP 5. Triggers
-- ---------------------------------------------------------------------------------------------
CREATE TRIGGER on_course_insertion
    AFTER INSERT ON courses
    FOR EACH ROW EXECUTE FUNCTION public.create_general_class();

CREATE TRIGGER on_enrollment_insert_add_class_member
    AFTER INSERT ON enrollments
    FOR EACH ROW EXECUTE FUNCTION public.add_enrollment_to_general_class();

CREATE TRIGGER on_enrollment_delete_remove_class_member
    AFTER DELETE ON enrollments
    FOR EACH ROW EXECUTE FUNCTION public.remove_enrollment_from_general_class();

-- ---------------------------------------------------------------------------------------------
-- STEP 6. Row Level Security
-- ---------------------------------------------------------------------------------------------
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_members ENABLE ROW LEVEL SECURITY;

-- classes: SELECT ---------------------------------------------------------------------------
CREATE POLICY "Admins can view all classes"
ON public.classes FOR SELECT TO authenticated
USING (public.current_user_role() = 'admin');

CREATE POLICY "Instructors can view their own classes"
ON public.classes FOR SELECT TO authenticated
USING (instructor_id = (SELECT auth.uid()));

-- course-owner visibility (see scope note at the top)
CREATE POLICY "Instructors can view general classes for their courses"
ON public.classes FOR SELECT TO authenticated
USING (
    is_general = true
    AND public.current_user_role() = 'instructor'
    AND EXISTS (
        SELECT 1 FROM public.courses AS co
        WHERE co.id = classes.course_id AND co.instructor_id = (SELECT auth.uid())
    )
);

-- review note 2: a member can read the classes they belong to, and only those, so the join
-- codes of other classes are not enumerable
CREATE POLICY "Members can view their classes"
ON public.classes FOR SELECT TO authenticated
USING (public.is_class_member(id));

-- classes: INSERT — none on purpose; create_regular_class() is the only path (review note 3)

-- classes: UPDATE / DELETE ----------------------------------------------------------------------
CREATE POLICY "Instructors can update their own classes"
ON public.classes FOR UPDATE TO authenticated
USING (instructor_id = (SELECT auth.uid()) AND is_general = false)
WITH CHECK (instructor_id = (SELECT auth.uid()) AND is_general = false);

CREATE POLICY "Admins can update classes"
ON public.classes FOR UPDATE TO authenticated
USING (public.current_user_role() = 'admin')
WITH CHECK (public.current_user_role() = 'admin');

-- general classes are plumbing: they go only when their course goes (ON DELETE CASCADE)
CREATE POLICY "Instructors can delete their own classes"
ON public.classes FOR DELETE TO authenticated
USING (instructor_id = (SELECT auth.uid()) AND is_general = false);

CREATE POLICY "Admins can delete regular classes"
ON public.classes FOR DELETE TO authenticated
USING (public.current_user_role() = 'admin' AND is_general = false);

-- class_members: SELECT -------------------------------------------------------------------------
CREATE POLICY "Users can view their own class memberships"
ON public.class_members FOR SELECT TO authenticated
USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Instructors can view members of their own classes"
ON public.class_members FOR SELECT TO authenticated
USING (public.current_user_role() = 'instructor' AND public.instructs_class(class_id));

CREATE POLICY "Admins can view all class memberships"
ON public.class_members FOR SELECT TO authenticated
USING (public.current_user_role() = 'admin');

-- class_members: INSERT — none on purpose; join_class_by_code() and the triggers are the paths

-- class_members: DELETE -------------------------------------------------------------------------
-- A student may leave a regular class; general-class membership follows the enrollment instead.
CREATE POLICY "Users can leave regular classes"
ON public.class_members FOR DELETE TO authenticated
USING (user_id = (SELECT auth.uid()) AND NOT public.class_is_general(class_id));

CREATE POLICY "Instructors can remove members from their own classes"
ON public.class_members FOR DELETE TO authenticated
USING (public.instructs_class(class_id) AND NOT public.class_is_general(class_id));

CREATE POLICY "Admins can remove members from regular classes"
ON public.class_members FOR DELETE TO authenticated
USING (public.current_user_role() = 'admin' AND NOT public.class_is_general(class_id));

-- enrollments / user_progress / courses: what instructors and admins may read ------------------
CREATE POLICY "Instructors can view enrollments for their class members"
ON public.enrollments FOR SELECT TO authenticated
USING (
    public.current_user_role() = 'instructor'
    AND public.instructs_student_in_course(user_id, course_id)
);

CREATE POLICY "Instructors can view progress for their class members"
ON public.user_progress FOR SELECT TO authenticated
USING (
    public.current_user_role() = 'instructor'
    AND EXISTS (
        SELECT 1 FROM public.lessons AS l
        WHERE l.id = user_progress.lesson_id
          AND public.instructs_student_in_course(user_progress.user_id, l.course_id)
    )
);

CREATE POLICY "Admins can view all enrollments"
ON public.enrollments FOR SELECT TO authenticated
USING (public.current_user_role() = 'admin');

CREATE POLICY "Admins can view all user progress"
ON public.user_progress FOR SELECT TO authenticated
USING (public.current_user_role() = 'admin');

-- An instructor can see their own courses even while unpublished (courses_select_published
-- in 004 hides them from everyone else).
CREATE POLICY "Instructors can view their assigned courses"
ON public.courses FOR SELECT TO authenticated
USING (instructor_id = (SELECT auth.uid()));

GRANT SELECT, UPDATE, DELETE ON public.classes TO authenticated;
GRANT SELECT, DELETE ON public.class_members TO authenticated;
