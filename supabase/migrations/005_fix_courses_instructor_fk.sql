-- Fix courses.instructor_id foreign key to reference public.users instead of auth.users
-- This allows the Supabase query join: courses.select('*, users(name, username)') to work

ALTER TABLE courses
  DROP CONSTRAINT courses_instructor_id_fkey,
  ADD CONSTRAINT courses_instructor_id_fkey
    FOREIGN KEY (instructor_id) REFERENCES public.users(id) ON DELETE CASCADE;
