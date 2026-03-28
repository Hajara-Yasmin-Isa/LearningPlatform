-- store lesson content for the education platform


CREATE TABLE lessons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  lesson_order INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- enable row level security (RLS) 
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;


-- security policies
-- only authenticated users can read lessons 
CREATE POLICY "lessons_select_policy"
  ON lessons
  FOR SELECT
  TO authenticated
  USING (true);

-- only admins can insert lessons
CREATE POLICY "lessons_insert_policy"
  ON lessons
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- only admins can update lessons
CREATE POLICY "lessons_update_policy"
  ON lessons
  FOR UPDATE
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- only admins can delete lessons
CREATE POLICY "lessons_delete_policy"
  ON lessons
  FOR DELETE
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin');


-- index on lesson_order 
CREATE INDEX idx_lessons_order ON lessons(lesson_order);
