-- Waitlist table — stores emails of people who want to be notified at launch

CREATE TABLE waitlist (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  signed_up_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;

-- Anyone can insert their own email (no auth required — this is pre-launch)
CREATE POLICY "waitlist_insert_policy"
  ON waitlist
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Only admins can read the waitlist
CREATE POLICY "waitlist_select_policy"
  ON waitlist
  FOR SELECT
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin');
