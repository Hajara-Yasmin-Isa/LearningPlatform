-- widen the exercise_type check to allow 'matching' exercises
-- existing rows are unaffected; this only broadens what's permitted
ALTER TABLE exercises DROP CONSTRAINT IF EXISTS exercises_exercise_type_check;
ALTER TABLE exercises ADD CONSTRAINT exercises_exercise_type_check
  CHECK (exercise_type IN ('multiple_choice', 'code', 'text', 'matching'));