-- Add course_id to lessons table to link lessons to a specific course
-- NULL allowed so existing rows are not broken

ALTER TABLE lessons ADD COLUMN course_id UUID REFERENCES courses(id) ON DELETE CASCADE;

CREATE INDEX idx_lessons_course ON lessons(course_id);
