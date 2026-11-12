-- Four-role verification for 012_create_classes.sql (A2.1, task 4).
--
-- How to run: in the Supabase SQL editor (or psql) against a DEV database that has the migration
-- applied. Replace the four ids below, run the whole file, and compare each count with the
-- "expect" comment. Everything runs inside a transaction that is rolled back, so nothing changes.
--
-- It simulates a signed-in user exactly the way PostgREST does: the `authenticated` role plus a
-- JWT claim `sub` = the user's id, which is what auth.uid() reads.

BEGIN;

-- >>> fill these in <<<
-- an admin, an instructor who owns a course with enrolled students, a second instructor who owns
-- none of those courses, and a student enrolled in the first instructor's course.
CREATE TEMP TABLE ids (who TEXT PRIMARY KEY, id UUID) ON COMMIT DROP;
INSERT INTO ids VALUES
  ('admin',       '00000000-0000-0000-0000-000000000000'),
  ('instructor1', '00000000-0000-0000-0000-000000000000'),
  ('instructor2', '00000000-0000-0000-0000-000000000000'),
  ('student1',    '00000000-0000-0000-0000-000000000000');

-- Totals as the migration owner (bypasses RLS) — the "everyone" baseline
SELECT 'baseline' AS as_who,
       (SELECT count(*) FROM public.classes)       AS classes,
       (SELECT count(*) FROM public.class_members) AS members,
       (SELECT count(*) FROM public.enrollments)   AS enrollments,
       (SELECT count(*) FROM public.user_progress) AS progress;

-- 1. admin: expect every row of every table (same numbers as the baseline)
SELECT set_config('request.jwt.claims', json_build_object('sub', (SELECT id FROM ids WHERE who = 'admin'), 'role', 'authenticated')::text, true);
SET LOCAL ROLE authenticated;
SELECT 'admin' AS as_who,
       (SELECT count(*) FROM public.classes)       AS classes,
       (SELECT count(*) FROM public.class_members) AS members,
       (SELECT count(*) FROM public.enrollments)   AS enrollments,
       (SELECT count(*) FROM public.user_progress) AS progress;
RESET ROLE;

-- 2. instructor1: expect only their classes (incl. the general class of their courses), only the
--    members / enrollments / progress of students in those classes, and zero rows from other courses
SELECT set_config('request.jwt.claims', json_build_object('sub', (SELECT id FROM ids WHERE who = 'instructor1'), 'role', 'authenticated')::text, true);
SET LOCAL ROLE authenticated;
SELECT 'instructor1' AS as_who,
       (SELECT count(*) FROM public.classes)       AS classes,
       (SELECT count(*) FROM public.class_members) AS members,
       (SELECT count(*) FROM public.enrollments)   AS enrollments,
       (SELECT count(*) FROM public.user_progress) AS progress,
       (SELECT count(*) FROM public.enrollments e
         WHERE NOT EXISTS (SELECT 1 FROM public.courses c WHERE c.id = e.course_id
                           AND c.instructor_id = (SELECT id FROM ids WHERE who = 'instructor1'))) AS leaked_other_course_enrollments;  -- expect 0
RESET ROLE;

-- 3. instructor2 (owns none of these courses, runs no class): expect 0 members, 0 enrollments,
--    0 progress, and only classes they own (0 here)
SELECT set_config('request.jwt.claims', json_build_object('sub', (SELECT id FROM ids WHERE who = 'instructor2'), 'role', 'authenticated')::text, true);
SET LOCAL ROLE authenticated;
SELECT 'instructor2' AS as_who,
       (SELECT count(*) FROM public.classes)       AS classes,
       (SELECT count(*) FROM public.class_members) AS members,
       (SELECT count(*) FROM public.enrollments)   AS enrollments,
       (SELECT count(*) FROM public.user_progress) AS progress;
RESET ROLE;

-- 4. student1: expect only their own memberships, enrollments and progress, and only the classes
--    they belong to; join codes of other classes must not be visible
SELECT set_config('request.jwt.claims', json_build_object('sub', (SELECT id FROM ids WHERE who = 'student1'), 'role', 'authenticated')::text, true);
SET LOCAL ROLE authenticated;
SELECT 'student1' AS as_who,
       (SELECT count(*) FROM public.classes)       AS classes,
       (SELECT count(*) FROM public.class_members) AS members,
       (SELECT count(*) FROM public.enrollments)   AS enrollments,
       (SELECT count(*) FROM public.user_progress) AS progress,
       (SELECT count(*) FROM public.class_members WHERE user_id <> (SELECT id FROM ids WHERE who = 'student1')) AS leaked_other_members,       -- expect 0
       (SELECT count(*) FROM public.classes c WHERE c.join_code IS NOT NULL
          AND NOT EXISTS (SELECT 1 FROM public.class_members m WHERE m.class_id = c.id
                          AND m.user_id = (SELECT id FROM ids WHERE who = 'student1'))) AS leaked_join_codes;  -- expect 0
RESET ROLE;

-- 5. signed out: expect 0 everywhere
SELECT set_config('request.jwt.claims', '', true);
SET LOCAL ROLE anon;
SELECT 'anon' AS as_who,
       (SELECT count(*) FROM public.classes)       AS classes,
       (SELECT count(*) FROM public.class_members) AS members;
RESET ROLE;

ROLLBACK;
