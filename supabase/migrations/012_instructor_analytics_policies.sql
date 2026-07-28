-- migrations/012_instructor_analytics_policies.sql
-- Instructor analytics: lets instructors read enrollments and progress rows
-- for courses they own. Purely ADDITIVE — no existing policy is dropped or
-- altered, and RLS policies are permissive (OR-combined), so students keep
-- exactly the access they already have.
-- Depends on: courses/enrollments (004), lessons (001/007), user_progress (006)

-- ============================================================
-- courses
-- ============================================================

-- Instructors can view their own courses, including unpublished drafts.
-- Also required by the two policies below: their EXISTS subqueries on
-- courses are subject to courses' RLS, and without this policy an
-- instructor's draft courses would be invisible to them.
CREATE POLICY "courses_instructor_select_policy"
  ON courses FOR SELECT
  TO authenticated
  USING (instructor_id = auth.uid());

-- ============================================================
-- enrollments
-- ============================================================

-- Instructors can view enrollments in their own courses
CREATE POLICY "enrollments_instructor_select_policy"
  ON enrollments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM courses
      WHERE courses.id = enrollments.course_id
      AND courses.instructor_id = auth.uid()
    )
  );

-- ============================================================
-- user_progress
-- ============================================================

-- Instructors can view progress on lessons in their own courses
CREATE POLICY "user_progress_instructor_select_policy"
  ON user_progress FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM lessons
      JOIN courses ON courses.id = lessons.course_id
      WHERE lessons.id = user_progress.lesson_id
      AND courses.instructor_id = auth.uid()
    )
  );
