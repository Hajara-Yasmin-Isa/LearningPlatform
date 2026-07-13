-- Add function_name and test_cases to exercises table for code-type exercises
-- NULL allowed so existing rows are not broken
ALTER TABLE exercises ADD COLUMN function_name TEXT;
ALTER TABLE exercises ADD COLUMN test_cases JSONB;