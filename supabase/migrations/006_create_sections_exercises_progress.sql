-- migrations/006_create_sections_exercises_progress.sql
-- Creates sections, exercises, and user_progress tables required by the lesson viewer.
-- Depends on: lessons (001), auth.users


-- ============================================================
-- sections
-- ============================================================

CREATE TABLE sections (
  id            UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  lesson_id     UUID        NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  title         TEXT        NOT NULL,
  content       TEXT,
  section_order INTEGER     NOT NULL,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE sections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "sections_select_policy"
  ON sections FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "sections_insert_policy"
  ON sections FOR INSERT
  TO authenticated
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "sections_update_policy"
  ON sections FOR UPDATE
  TO authenticated
  USING  (auth.jwt() ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "sections_delete_policy"
  ON sections FOR DELETE
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin');

CREATE INDEX idx_sections_lesson ON sections(lesson_id);


-- ============================================================
-- exercises
-- ============================================================

CREATE TABLE exercises (
  id             UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  section_id     UUID        NOT NULL REFERENCES sections(id) ON DELETE CASCADE,
  question       TEXT        NOT NULL,
  exercise_type  TEXT        NOT NULL CHECK (exercise_type IN ('multiple_choice', 'code', 'text')),
  correct_answer TEXT        NOT NULL,
  options        JSONB,
  exercise_order INTEGER     NOT NULL,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;

CREATE POLICY "exercises_select_policy"
  ON exercises FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "exercises_insert_policy"
  ON exercises FOR INSERT
  TO authenticated
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "exercises_update_policy"
  ON exercises FOR UPDATE
  TO authenticated
  USING  (auth.jwt() ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "exercises_delete_policy"
  ON exercises FOR DELETE
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin');

CREATE INDEX idx_exercises_section ON exercises(section_id);


-- ============================================================
-- user_progress
-- ============================================================

CREATE TABLE user_progress (
  id            UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id       UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id     UUID        NOT NULL REFERENCES lessons(id)    ON DELETE CASCADE,
  -- ON DELETE SET NULL: preserve progress history if a section is removed
  section_id    UUID        REFERENCES sections(id) ON DELETE SET NULL,
  completed     BOOLEAN     DEFAULT false,
  last_accessed TIMESTAMPTZ DEFAULT NOW(),
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, lesson_id, section_id)
);

ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_progress_select_policy"
  ON user_progress FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "user_progress_insert_policy"
  ON user_progress FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_progress_update_policy"
  ON user_progress FOR UPDATE
  TO authenticated
  USING  (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_progress_user ON user_progress(user_id);
