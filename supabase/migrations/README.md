# Database Migrations

## What Are Migrations?

Migrations are SQL files that define your database schema. Each migration:
- Creates or modifies tables
- Sets up security policies (RLS)
- Establishes relationships between tables

## Naming Convention

```
001_create_lessons.sql
002_create_sections.sql
003_create_exercises.sql
004_add_language_support.sql
```

Rules:
- Start with a 3-digit number (001, 002, etc.)
- Use descriptive names
- One major change per file
- Never edit old migrations (create new ones instead)

## Required Elements in Every Migration

### 1. Table Creation
```sql
CREATE TABLE table_name (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  -- your columns here
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 2. Enable RLS (REQUIRED!)
```sql
ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;
```

### 3. Create Policies
```sql
-- Read policy
CREATE POLICY "policy_name"
  ON table_name FOR SELECT
  TO authenticated
  USING (true);

-- Write policy (be more restrictive)
CREATE POLICY "only_own_data"
  ON table_name FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);
```

## Example: Complete Migration

```sql
-- migrations/001_create_lessons.sql

-- Create lessons table
CREATE TABLE lessons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  lesson_order INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read all lessons
CREATE POLICY "authenticated_users_read_lessons"
  ON lessons FOR SELECT
  TO authenticated
  USING (true);

-- Only allow admins to insert lessons (example)
-- CREATE POLICY "admins_insert_lessons"
--   ON lessons FOR INSERT
--   TO authenticated
--   WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- Create index for ordering
CREATE INDEX idx_lessons_order ON lessons(lesson_order);
```

## Foreign Keys Example

```sql
-- migrations/002_create_sections.sql

CREATE TABLE sections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  section_order INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE sections ENABLE ROW LEVEL SECURITY;

-- Policy: users can read sections if they can read the lesson
CREATE POLICY "users_read_sections"
  ON sections FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM lessons
      WHERE lessons.id = sections.lesson_id
    )
  );
```

## Best Practices

### DO:
- ✅ Test migrations locally before committing
- ✅ Use explicit column types
- ✅ Add indexes for columns used in WHERE/ORDER BY
- ✅ Use foreign keys with CASCADE options
- ✅ Document complex policies with comments

### DON'T:
- ❌ Edit existing migration files
- ❌ Forget to enable RLS
- ❌ Create tables without policies
- ❌ Use `SELECT *` in policies
- ❌ Make migrations that depend on data existing

## Testing Your Migration

1. Apply migration to your local Supabase project
2. Test policies by trying to:
   - Read data (should work for authenticated users)
   - Write data (should follow your restrictions)
   - Access data from different user accounts

## Common Patterns

### Ordered Items
```sql
CREATE TABLE items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  item_order INTEGER NOT NULL
);

CREATE INDEX idx_items_order ON items(item_order);
```

### User-Owned Data
```sql
CREATE TABLE user_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  -- other columns
);

-- Only users can see their own progress
CREATE POLICY "users_own_progress"
  ON user_progress FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

### JSON Content
```sql
CREATE TABLE exercises (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content JSONB NOT NULL,  -- Use JSONB for structured data
  -- other columns
);

-- Index for JSON queries
CREATE INDEX idx_exercises_content ON exercises USING GIN (content);
```

## Need Help?

- Review existing migrations in this directory
- Check Supabase RLS documentation
- Ask backend team in Slack
- Create a draft PR for review

## Security Checklist

Before committing any migration, verify:

- [ ] RLS is enabled on all new tables
- [ ] Policies are defined for SELECT, INSERT, UPDATE, DELETE
- [ ] Foreign keys have appropriate CASCADE/RESTRICT
- [ ] Sensitive data is protected by RLS
- [ ] Policies use `auth.uid()` correctly