-- =============================================================================
-- SEED FILE: seed_instructor_test.sql
-- Purpose: Test data for the INSTRUCTOR DASHBOARD (Team A cards A1.3, A1.4,
--          A2.1, A2.2, A3.3). Gives one instructor two courses, four enrolled
--          students at different stages, and a second instructor who should
--          see NONE of it. It touches ONLY the @test.local accounts and the
--          three English demo courses from seed_lessons.sql — never a real
--          learner or the Hausa course — so it is safe to run on the shared
--          Supabase project.
--
-- Requires: seed_lessons.sql already loaded (uses its courses/lessons/sections).
--
-- HOW TO USE
--   The six test accounts already exist in Supabase Auth (see the ID table
--   below); the signup trigger (migration 002) created their public.users
--   rows. Paste this whole file into the Supabase SQL editor and run it.
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

-- ---- 1. Test accounts (created in Supabase Auth, Oct 2026) ------------------
--   instructor1  e2eab5f4-8fa3-4c8a-ab1c-125c5c96c9b4   instructor1@test.local
--   instructor2  38b0f56b-5dcd-4f00-a793-4db7dd210123   instructor2@test.local
--   student1     39947a06-20ca-4922-a230-bf7177f433b9   student1@test.local
--   student2     aa4dcecd-10f1-4a23-85ae-4883f1f806f1   student2@test.local
--   student3     421b51ac-fc3a-459a-aaa9-7d6ce51f1e21   student3@test.local
--   student4     df344742-d680-42cd-a87e-468a28187b0d   student4@test.local
-- To re-point this seed at different accounts, replace the UUIDs throughout.

-- ---- 2. Roles and readable names ------------------------------------------
UPDATE users SET role = 'instructor', name = 'Test Instructor One' WHERE id = 'e2eab5f4-8fa3-4c8a-ab1c-125c5c96c9b4';
UPDATE users SET role = 'instructor', name = 'Test Instructor Two' WHERE id = '38b0f56b-5dcd-4f00-a793-4db7dd210123';
UPDATE users SET role = 'student',    name = 'Amina (test)'        WHERE id = '39947a06-20ca-4922-a230-bf7177f433b9';
UPDATE users SET role = 'student',    name = 'Bello (test)'        WHERE id = 'aa4dcecd-10f1-4a23-85ae-4883f1f806f1';
UPDATE users SET role = 'student',    name = 'Chidi (test)'        WHERE id = '421b51ac-fc3a-459a-aaa9-7d6ce51f1e21';
UPDATE users SET role = 'student',    name = 'Dada (test)'         WHERE id = 'df344742-d680-42cd-a87e-468a28187b0d';

-- ---- 3. Course ownership (replaces the ffffffff placeholder) --------------
UPDATE courses SET instructor_id = 'e2eab5f4-8fa3-4c8a-ab1c-125c5c96c9b4'
WHERE id IN ('10000000-0000-0000-0000-000000000001',   -- Introduction to Python
             '10000000-0000-0000-0000-000000000002');  -- Web Basics
UPDATE courses SET instructor_id = '38b0f56b-5dcd-4f00-a793-4db7dd210123'
WHERE id = '10000000-0000-0000-0000-000000000003';     -- Logic & Data Structures

-- ---- 4. Enrollments ---------------------------------------------------------
INSERT INTO enrollments (user_id, course_id, enrolled_at) VALUES
  ('39947a06-20ca-4922-a230-bf7177f433b9', '10000000-0000-0000-0000-000000000001', NOW() - INTERVAL '30 days'),
  ('aa4dcecd-10f1-4a23-85ae-4883f1f806f1', '10000000-0000-0000-0000-000000000001', NOW() - INTERVAL '14 days'),
  ('421b51ac-fc3a-459a-aaa9-7d6ce51f1e21', '10000000-0000-0000-0000-000000000001', NOW() - INTERVAL '21 days'),
  ('df344742-d680-42cd-a87e-468a28187b0d', '10000000-0000-0000-0000-000000000002', NOW() - INTERVAL '7 days')
ON CONFLICT (user_id, course_id) DO NOTHING;

-- ---- 5. Progress -------------------------------------------------------------
-- Section IDs come from seed_lessons.sql:
--   Python  lesson 1 → sections …0001, …0002   lesson 2 → …0003, …0004   lesson 3 → …0005, …0006
--   Web     lesson 4 → sections …0007, …0008

-- student1: finished Python (6/6)
INSERT INTO user_progress (user_id, lesson_id, section_id, completed, last_accessed) VALUES
  ('39947a06-20ca-4922-a230-bf7177f433b9', '20000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', true, NOW() - INTERVAL '28 days'),
  ('39947a06-20ca-4922-a230-bf7177f433b9', '20000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000002', true, NOW() - INTERVAL '27 days'),
  ('39947a06-20ca-4922-a230-bf7177f433b9', '20000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000003', true, NOW() - INTERVAL '20 days'),
  ('39947a06-20ca-4922-a230-bf7177f433b9', '20000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000004', true, NOW() - INTERVAL '19 days'),
  ('39947a06-20ca-4922-a230-bf7177f433b9', '20000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000005', true, NOW() - INTERVAL '10 days'),
  ('39947a06-20ca-4922-a230-bf7177f433b9', '20000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000006', true, NOW() - INTERVAL '9 days')
ON CONFLICT (user_id, lesson_id, section_id) DO NOTHING;

-- student2: halfway through Python (3/6), active this week
INSERT INTO user_progress (user_id, lesson_id, section_id, completed, last_accessed) VALUES
  ('aa4dcecd-10f1-4a23-85ae-4883f1f806f1', '20000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', true, NOW() - INTERVAL '12 days'),
  ('aa4dcecd-10f1-4a23-85ae-4883f1f806f1', '20000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000002', true, NOW() - INTERVAL '8 days'),
  ('aa4dcecd-10f1-4a23-85ae-4883f1f806f1', '20000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000003', true, NOW() - INTERVAL '2 days')
ON CONFLICT (user_id, lesson_id, section_id) DO NOTHING;

-- student3: enrolled in Python, never started (no progress rows on purpose)

-- student4: just started Web Basics (1/6)
INSERT INTO user_progress (user_id, lesson_id, section_id, completed, last_accessed) VALUES
  ('df344742-d680-42cd-a87e-468a28187b0d', '20000000-0000-0000-0000-000000000004', '30000000-0000-0000-0000-000000000007', true, NOW() - INTERVAL '3 days')
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
