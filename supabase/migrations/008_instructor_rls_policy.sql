-- Instructors can read their own courses (published or unpublished)
CREATE POLICY "courses_select_own"
    ON courses FOR SELECT   
    TO authenticated
    USING (auth.uid() = instructor_id);