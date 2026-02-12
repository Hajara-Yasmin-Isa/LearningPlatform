-- Migration: Create users table
-- Purpose: Store user profile data (name, username, role) linked to Supabase auth.users

-- ============================================================================
-- IMPORTANT: Why email and password are NOT in this table
-- ============================================================================
--
-- This table follows Supabase's recommended authentication pattern:
--
-- 1. AUTHENTICATION (handled by Supabase auth.users table):
--    - Email (stored securely)
--    - Password (automatically hashed by Supabase)
--    - Login/signup functionality
--    - Password reset
--    - Email verification
--
-- 2. USER DATA (handled by this users table):
--    - Name
--    - Username
--    - Role
--    - Other profile information
--
-- This separation provides:
-- ✓ Better security (Supabase manages password hashing)
-- ✓ Built-in authentication features
-- ============================================================================

-- 1. CREATE USERS TABLE

CREATE TABLE users (
  -- Primary key: Uses the same UUID as auth.users
  -- This creates a 1-to-1 relationship between auth.users and users
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  username TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('student', 'instructor', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. ENABLE ROW LEVEL SECURITY (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 3. CREATE SECURITY POLICIES

-- Policy 1: Users can view all user profiles
-- Allows users to see other users' names and usernames (for social features, leaderboards, etc.)
-- To make profiles private, change USING (true) to USING (auth.uid() = id)
CREATE POLICY "users_select_policy"
  ON users
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy 2: Users can only insert their own user record
-- Prevents users from creating records for other people
CREATE POLICY "users_insert_policy"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Policy 3: Users can only update their own user record
-- Prevents users from editing other people's data
CREATE POLICY "users_update_policy"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Policy 4: Users can delete their own accounts
-- Frontend should show confirmation popup before deletion
CREATE POLICY "users_delete_policy"
  ON users
  FOR DELETE
  TO authenticated
  USING (auth.uid() = id);

-- 4. CREATE INDEXES FOR PERFORMANCE

-- Index on username for fast lookups
CREATE INDEX idx_users_username ON users(username);

-- Index on role for filtering users by role
CREATE INDEX idx_users_role ON users(role);

-- 5. CREATE TRIGGER TO AUTO-CREATE USER RECORDS

-- This trigger automatically creates a user record when someone signs up via Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, name, username, role)
  VALUES (
    NEW.id,           -- Use the new auth.users ID
    '',               -- Empty name (user will update later)
    NEW.email,        -- Use email as initial username
    'student'         -- Default role
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 2: Create trigger that fires on new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 6. COMMENTS FOR DOCUMENTATION

COMMENT ON TABLE users IS 'User profile data complementing auth.users authentication table';
COMMENT ON COLUMN users.id IS 'References auth.users.id - linked via same UUID';
COMMENT ON COLUMN users.name IS 'User full name';
COMMENT ON COLUMN users.username IS 'Unique username for the platform';
COMMENT ON COLUMN users.role IS 'User role: student, instructor, or admin';
COMMENT ON COLUMN users.created_at IS 'Timestamp of when user record was created';

-- END OF MIGRATION

-- Note: Email and password are managed by Supabase auth.users table
-- This provides secure password hashing and authentication out of the box
