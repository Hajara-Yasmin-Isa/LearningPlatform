-- Fix admin RLS policies: replace auth.jwt() ->> 'role' = 'admin'
-- (which checks the Supabase service role, never 'admin') with a lookup
-- against the application-level role stored in public.users.

-- ============================================================
-- lessons
-- ============================================================
DROP POLICY IF EXISTS "Admins can insert lessons" ON lessons;
DROP POLICY IF EXISTS "Admins can update lessons" ON lessons;
DROP POLICY IF EXISTS "Admins can delete lessons" ON lessons;

CREATE POLICY "Admins can insert lessons" ON lessons
  FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can update lessons" ON lessons
  FOR UPDATE
  USING  (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins can delete lessons" ON lessons
  FOR DELETE
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));

-- ============================================================
-- courses
-- ============================================================
DROP POLICY IF EXISTS "Admins can insert courses" ON courses;
DROP POLICY IF EXISTS "Admins can update courses" ON courses;
DROP POLICY IF EXISTS "Admins can delete courses" ON courses;

CREATE POLICY "Admins can insert courses" ON courses
  FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can update courses" ON courses
  FOR UPDATE
  USING  (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins can delete courses" ON courses
  FOR DELETE
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));

-- ============================================================
-- sections
-- ============================================================
DROP POLICY IF EXISTS "Admins can insert sections" ON sections;
DROP POLICY IF EXISTS "Admins can update sections" ON sections;
DROP POLICY IF EXISTS "Admins can delete sections" ON sections;

CREATE POLICY "Admins can insert sections" ON sections
  FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can update sections" ON sections
  FOR UPDATE
  USING  (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins can delete sections" ON sections
  FOR DELETE
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));

-- ============================================================
-- exercises
-- ============================================================
DROP POLICY IF EXISTS "Admins can insert exercises" ON exercises;
DROP POLICY IF EXISTS "Admins can update exercises" ON exercises;
DROP POLICY IF EXISTS "Admins can delete exercises" ON exercises;

CREATE POLICY "Admins can insert exercises" ON exercises
  FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can update exercises" ON exercises
  FOR UPDATE
  USING  (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins can delete exercises" ON exercises
  FOR DELETE
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));

-- ============================================================
-- waitlist
-- ============================================================
DROP POLICY IF EXISTS "Admins can view waitlist" ON waitlist;

CREATE POLICY "Admins can view waitlist" ON waitlist
  FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));

-- ============================================================
-- beta_feedback
-- ============================================================
DROP POLICY IF EXISTS "Admins can view all feedback" ON beta_feedback;

CREATE POLICY "Admins can view all feedback" ON beta_feedback
  FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));
