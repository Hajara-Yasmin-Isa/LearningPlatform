-- Courses and enrollments tables

CREATE TABLE courses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('Beginner', 'Intermediate', 'Advanced')),
  duration_minutes INTEGER,
  instructor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  published BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE courses ENABLE ROW LEVEL SECURITY;

-- Anyone can view published courses
CREATE POLICY "courses_select_published"
  ON courses FOR SELECT
  USING (published = true);

-- Only admins can insert courses
CREATE POLICY "courses_insert_policy"
  ON courses FOR INSERT
  TO authenticated
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- Only admins can update courses
CREATE POLICY "courses_update_policy"
  ON courses FOR UPDATE
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- Only admins can delete courses
CREATE POLICY "courses_delete_policy"
  ON courses FOR DELETE
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin');

CREATE INDEX idx_courses_published ON courses(published);
CREATE INDEX idx_courses_instructor ON courses(instructor_id);

-- Enrollments table
CREATE TABLE enrollments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, course_id)
);

ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;

-- Users can view their own enrollments
CREATE POLICY "enrollments_select_policy"
  ON enrollments FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Authenticated users can enroll themselves
CREATE POLICY "enrollments_insert_policy"
  ON enrollments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can unenroll themselves
CREATE POLICY "enrollments_delete_policy"
  ON enrollments FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX idx_enrollments_user ON enrollments(user_id);
CREATE INDEX idx_enrollments_course ON enrollments(course_id);
