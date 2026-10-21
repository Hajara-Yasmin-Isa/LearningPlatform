-- =============================================================================
-- SEED FILE: seed_instructor_test.sql
-- Purpose: Test data for the INSTRUCTOR DASHBOARD (Team A cards A1.3, A1.4,
--          A2.1, A2.2, A3.3). Gives one instructor two courses, four enrolled
--          students at different stages, and a second instructor who should
--          see NONE of it. Run it against your local/dev database, never
--          production.
--
-- Requires: seed_lessons.sql already loaded (uses its courses/lessons/sections).
--
-- HOW TO USE
--   1. Create 6 test accounts in Supabase Auth (Authentication → Users →
--      "Add user", tick "Auto Confirm"). Suggested emails:
--        instructor1@test.local   instructor2@test.local
--        student1@test.local      student2@test.local
--        student3@test.local      student4@test.local
--      The signup trigger (migration 002) creates their public.users rows.
--   2. Paste each account's UUID into the six \set lines below.
--   3. Run the whole file in the Supabase SQL editor.
--   Safe to re-run: every insert is ON CONFLICT DO NOTHING or an UPDATE.
--
-- WHAT YOU GET (so you can check the dashboard against known numbers)
--   instructor1 owns:
--     "Introduction to Python"   — 3 lessons · 6 sections · 3 students enrolled
--     "Web Basics"               — 3 lessons · 6 sections · 1 student enrolled
--   instructor2 owns:
--     "Logic & Data Structures"  — 3 lessons · 6 sections · 0 students
--
--   Progress in "Introduction to Python" (6 sections total):
--     student1  6/6 complete  → 100%   (finished)
--     student2  3/6 complete  → 50%    (mid-course, active)
--     student3  0/6 complete  → 0%     (enrolled, never started — the
--                                        "who stopped coming back?" case)
--   Progress in "Web Basics":
--     student4  1/6 complete  → ~17%
--
--   Expected instructor1 stats (A1.4 getInstructorCourseStats):
--     Python:     enrollments 3, totalSections 6, averageCompletion 50%
--     Web Basics: enrollments 1, totalSections 6, averageCompletion ~17%
--   Expected instructor2 stats: Logic course with 0 enrollments, and NO
--     visibility into instructor1's students (cross-instructor isolation).
-- =============================================================================

-- ---- 1. Paste the six auth.users UUIDs here -------------------------------
\set instructor1 '00000000-0000-0000-0000-000000000000'
\set instructor2 '00000000-0000-0000-0000-000000000000'
\set student1    '00000000-0000-0000-0000-000000000000'
\set student2    '00000000-0000-0000-0000-000000000000'
\set student3    '00000000-0000-0000-0000-000000000000'
\set student4    '00000000-0000-0000-0000-000000000000'

-- Supabase's SQL editor does not support \set. If you are running there,
-- delete the six lines above and find-and-replace each :'name' token with
-- the quoted UUID, e.g. :'instructor1'  →  'c0ffee00-…'.

-- ---- 2. Roles and readable names ------------------------------------------
UPDATE users SET role = 'instructor', name = 'Test Instructor One' WHERE id = :'instructor1';
UPDATE users SET role = 'instructor', name = 'Test Instructor Two' WHERE id = :'instructor2';
UPDATE users SET role = 'student',    name = 'Amina (test)'        WHERE id = :'student1';
UPDATE users SET role = 'student',    name = 'Bello (test)'        WHERE id = :'student2';
UPDATE users SET role = 'student',    name = 'Chidi (test)'        WHERE id = :'student3';
UPDATE users SET role = 'student',    name = 'Dada (test)'         WHERE id = :'student4';

-- ---- 3. Course ownership (replaces the ffffffff placeholder) --------------
UPDATE courses SET instructor_id = :'instructor1'
WHERE id IN ('10000000-0000-0000-0000-000000000001',   -- Introduction to Python
             '10000000-0000-0000-0000-000000000002');  -- Web Basics
UPDATE courses SET instructor_id = :'instructor2'
WHERE id = '10000000-0000-0000-0000-000000000003';     -- Logic & Data Structures

-- ---- 4. Enrollments ---------------------------------------------------------
INSERT INTO enrollments (user_id, course_id, enrolled_at) VALUES
  (:'student1', '10000000-0000-0000-0000-000000000001', NOW() - INTERVAL '30 days'),
  (:'student2', '10000000-0000-0000-0000-000000000001', NOW() - INTERVAL '14 days'),
  (:'student3', '10000000-0000-0000-0000-000000000001', NOW() - INTERVAL '21 days'),
  (:'student4', '10000000-0000-0000-0000-000000000002', NOW() - INTERVAL '7 days')
ON CONFLICT (user_id, course_id) DO NOTHING;

-- ---- 5. Progress -------------------------------------------------------------
-- Section IDs come from seed_lessons.sql:
--   Python  lesson 1 → sections …0001, …0002   lesson 2 → …0003, …0004   lesson 3 → …0005, …0006
--   Web     lesson 4 → sections …0007, …0008

-- student1: finished Python (6/6)
INSERT INTO user_progress (user_id, lesson_id, section_id, completed, last_accessed) VALUES
  (:'student1', '20000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', true, NOW() - INTERVAL '28 days'),
  (:'student1', '20000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000002', true, NOW() - INTERVAL '27 days'),
  (:'student1', '20000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000003', true, NOW() - INTERVAL '20 days'),
  (:'student1', '20000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000004', true, NOW() - INTERVAL '19 days'),
  (:'student1', '20000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000005', true, NOW() - INTERVAL '10 days'),
  (:'student1', '20000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000006', true, NOW() - INTERVAL '9 days')
ON CONFLICT (user_id, lesson_id, section_id) DO NOTHING;

-- student2: halfway through Python (3/6), active this week
INSERT INTO user_progress (user_id, lesson_id, section_id, completed, last_accessed) VALUES
  (:'student2', '20000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', true, NOW() - INTERVAL '12 days'),
  (:'student2', '20000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000002', true, NOW() - INTERVAL '8 days'),
  (:'student2', '20000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000003', true, NOW() - INTERVAL '2 days')
ON CONFLICT (user_id, lesson_id, section_id) DO NOTHING;

-- student3: enrolled in Python, never started (no progress rows on purpose)

-- student4: just started Web Basics (1/6)
INSERT INTO user_progress (user_id, lesson_id, section_id, completed, last_accessed) VALUES
  (:'student4', '20000000-0000-0000-0000-000000000004', '30000000-0000-0000-0000-000000000007', true, NOW() - INTERVAL '3 days')
ON CONFLICT (user_id, lesson_id, section_id) DO NOTHING;

-- ---- 6. Sanity check: run this SELECT as the service role to see the world
-- SELECT c.title, u.name AS instructor,
--        (SELECT count(*) FROM enrollments e WHERE e.course_id = c.id)         AS enrolled,
--        (SELECT count(*) FROM sections s JOIN lessons l ON l.id = s.lesson_id
--          WHERE l.course_id = c.id)                                           AS sections
-- FROM courses c JOIN users u ON u.id = c.instructor_id
-- WHERE c.id LIKE '10000000-%' ORDER BY c.title;

-- ---- 7. What this seed deliberately does NOT fix -----------------------------
-- Reading other students' enrollments/progress AS instructor1 is still blocked
-- by RLS (enrollments_select_policy and user_progress_select_policy are
-- auth.uid() = user_id). That is the finding card A1.3 asks for and what
-- migration 012 (card A2.1, the classes model) resolves. Until then, verify
-- the expected numbers above with the service role, and document the blocked
-- policies on the card rather than loosening them.
