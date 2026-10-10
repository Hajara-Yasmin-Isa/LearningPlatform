-- Instructor RLS access: lets an instructor see their own courses (including
-- unpublished drafts) and count enrollments for courses they own.
-- Both policies are additive — Postgres RLS OR's multiple permissive SELECT
-- policies together, so the existing policies are untouched.

CREATE POLICY "courses_select_own"
  ON courses FOR SELECT
  TO authenticated
  USING (instructor_id = auth.uid());

CREATE POLICY "enrollments_select_own_courses"
  ON enrollments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM courses
      WHERE courses.id = enrollments.course_id
      AND courses.instructor_id = auth.uid()
    )
  );
