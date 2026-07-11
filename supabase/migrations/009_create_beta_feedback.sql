-- Beta feedback: lets logged-in users submit bug reports / suggestions from any page

CREATE TABLE IF NOT EXISTS beta_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  message TEXT NOT NULL,
  type TEXT CHECK (type IN ('bug', 'suggestion', 'other')) DEFAULT 'other',
  page TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE beta_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert their own feedback"
  ON beta_feedback FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Admin-only read access, added per hisa2's review feedback so an in-app
-- admin dashboard can view submissions later without a further migration
CREATE POLICY "beta_feedback_select_policy"
  ON beta_feedback FOR SELECT
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin');
