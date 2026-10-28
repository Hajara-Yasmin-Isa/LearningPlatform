-- Students who enroll in a course always land in that course's **general class**
-- Instructors run their own classes that students join by code

-- STEP 1a. Create classes table with foreign key to courses table
CREATE TABLE classes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    -- instructor_id is to be treated as "person who runs this class"
    instructor_id UUID NULL REFERENCES auth.users(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    join_code TEXT,
    CONSTRAINT classes_join_code_unique UNIQUE (join_code),
    is_general BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    -- 
    CONSTRAINT class_ownership_and_code_check
    CHECK (
        (is_general AND instructor_id IS NULL AND join_code IS NULL)
        OR
        (NOT is_general AND join_code IS NOT NULL)
    )   
);

-- STEP 1b. Create class members table with foreign keys to classes table and users table
CREATE TABLE class_members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (class_id, user_id)
);

-- STEP 2. Each course gets exactly one 'is_general = true'
CREATE UNIQUE INDEX one_general_class_per_course
ON classes (course_id)
where is_general = true;

-- General class is created with the course and enrollment auto-adds membership
CREATE OR REPLACE FUNCTION public.create_general_class()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO classes (course_id, name, is_general)
    VALUES (
        NEW.id,
        'General Class',
        true
    )
    ON CONFLICT (course_id) WHERE is_general = true
    DO NOTHING;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create function to add enrollments to their respective general class
CREATE OR REPLACE FUNCTION public.add_enrollment_to_general_class()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
    general_class_id UUID;
BEGIN
    -- Look for this course's general class.
    SELECT id
    INTO general_class_id
    FROM public.classes
    WHERE course_id = NEW.course_id
      AND is_general = true;

    -- If missing, attempt to create it.
    IF general_class_id IS NULL THEN
        INSERT INTO public.classes (
            course_id,
            name,
            is_general
        )
        VALUES (
            NEW.course_id,
            'General Class',
            true
        )
        ON CONFLICT (course_id) WHERE is_general = true
        DO NOTHING
        RETURNING id INTO general_class_id;

        -- Another transaction may have created it first.
        IF general_class_id IS NULL THEN
            SELECT id
            INTO general_class_id
            FROM public.classes
            WHERE course_id = NEW.course_id
              AND is_general = true;
        END IF;
    END IF;

    IF general_class_id IS NULL THEN
        RAISE EXCEPTION
            'Unable to find or create general class for course %',
            NEW.course_id;
    END IF;

    -- Add the enrolling student to the general class.
    INSERT INTO public.class_members (class_id, user_id)
    VALUES (general_class_id, NEW.user_id)
    ON CONFLICT (class_id, user_id) DO NOTHING;

    RETURN NEW;
END;
$$;



-- Join Code generator: 6-char codes, no look-alike characters; retries on the rare collision
CREATE OR REPLACE FUNCTION public.generate_join_code()
RETURNS TEXT
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
    alphabet TEXT := 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
    code TEXT;
BEGIN
    LOOP
        code := '';

        FOR i IN 1..6 LOOP
            code := code || substr(
                alphabet,
                1 + floor(random() * length(alphabet))::int,
                1
            );
        END LOOP;

        IF NOT EXISTS (
            SELECT 1
            FROM public.classes
            WHERE join_code = code
        ) THEN
            RETURN code;
        END IF;
    END LOOP;
END;
$$;

-- Create a regular instructor-run class.
CREATE OR REPLACE FUNCTION public.create_regular_class(
    p_course_id UUID,
    p_instructor_id UUID,
    p_name TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
    new_class_id UUID;
    failed_constraint TEXT;
BEGIN
    LOOP
        BEGIN
            INSERT INTO public.classes (
                course_id,
                instructor_id,
                name,
                join_code,
                is_general
            )
            VALUES (
                p_course_id,
                p_instructor_id,
                p_name,
                public.generate_join_code(),
                false
            )
            RETURNING id INTO new_class_id;

            RETURN new_class_id;

        EXCEPTION WHEN unique_violation THEN
            GET STACKED DIAGNOSTICS
                failed_constraint = CONSTRAINT_NAME;

            -- Retry only if the join code collided.
            IF failed_constraint <> 'classes_join_code_unique' THEN
                RAISE;
            END IF;
        END;
    END LOOP;
END;
$$;

-- Backfill
INSERT INTO public.classes (course_id, name, is_general)
SELECT c.id, 'General Class', true
FROM public.courses AS c
WHERE NOT EXISTS (
    SELECT 1
    FROM public.classes AS cl
    WHERE cl.course_id = c.id
      AND cl.is_general = true
)
ON CONFLICT (course_id) WHERE is_general = true
DO NOTHING;

INSERT INTO public.class_members (class_id, user_id)
SELECT cl.id, e.user_id
FROM public.enrollments AS e
JOIN public.classes AS cl
    ON cl.course_id = e.course_id
   AND cl.is_general = true
ON CONFLICT (class_id, user_id) DO NOTHING;

-- Create trigger for creating general class on course insertion 
CREATE TRIGGER on_course_insertion
    AFTER INSERT ON courses
    FOR EACH ROW
    EXECUTE FUNCTION public.create_general_class();

-- Create trigger for adding new enrollments to general class
CREATE TRIGGER on_enrollment_insert_add_class_member
    AFTER INSERT ON enrollments
    FOR EACH ROW
    EXECUTE FUNCTION public.add_enrollment_to_general_class();

-- Step 3. Update RLS 
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_members ENABLE ROW LEVEL SECURITY;

-- Step 3.b Add policies for classes and memberships
CREATE POLICY "Admins can view all classes"
ON public.classes
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1
        FROM public.users AS u
        WHERE u.id = (SELECT auth.uid())
          AND u.role = 'admin'
    )
);

CREATE POLICY "Instructors can view their own classes"
ON public.classes
FOR SELECT
TO authenticated
USING (
    instructor_id = (SELECT auth.uid())
    AND EXISTS (
        SELECT 1
        FROM public.users AS u
        WHERE u.id = (SELECT auth.uid())
          AND u.role IN ('instructor', 'admin')
    )
);

CREATE POLICY "Users can view their own class memberships"
ON public.class_members
FOR SELECT
TO authenticated
USING (
    user_id = (SELECT auth.uid())
);

CREATE POLICY "Instructors can view members of their own classes"
ON public.class_members
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1
        FROM public.classes AS c
        JOIN public.users AS u
          ON u.id = (SELECT auth.uid())
        WHERE c.id = class_members.class_id
          AND c.instructor_id = (SELECT auth.uid())
          AND u.role IN ('instructor', 'admin')
    )
);

CREATE POLICY "Admins can view all class memberships"
ON public.class_members
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1
        FROM public.users AS u
        WHERE u.id = (SELECT auth.uid())
          AND u.role = 'admin'
    )
);

CREATE POLICY "Instructors can view enrollments for their class members"
ON public.enrollments
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1
        FROM public.class_members AS cm
        JOIN public.classes AS c
          ON c.id = cm.class_id
        JOIN public.users AS u
          ON u.id = (SELECT auth.uid())
        WHERE cm.user_id = enrollments.user_id
          AND c.course_id = enrollments.course_id
          AND c.instructor_id = (SELECT auth.uid())
          AND u.role = 'instructor'
    )
);

CREATE POLICY "Instructors can view progress for their class members"
ON public.user_progress
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1
        FROM public.class_members AS cm
        JOIN public.classes AS c
          ON c.id = cm.class_id
        JOIN public.lessons AS l
          ON l.course_id = c.course_id
        JOIN public.users AS u
          ON u.id = (SELECT auth.uid())
        WHERE cm.user_id = user_progress.user_id
          AND l.id = user_progress.lesson_id
          AND c.instructor_id = (SELECT auth.uid())
          AND u.role = 'instructor'
    )
);

CREATE POLICY "Admins can view all enrollments"
ON public.enrollments
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1
        FROM public.users AS u
        WHERE u.id = (SELECT auth.uid())
          AND u.role = 'admin'
    )
);

CREATE POLICY "Admins can view all user progress"
ON public.user_progress
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1
        FROM public.users AS u
        WHERE u.id = (SELECT auth.uid())
          AND u.role = 'admin'
    )
);