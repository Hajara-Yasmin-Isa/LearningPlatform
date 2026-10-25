-- Students who enroll in a course always land in that course's **general class**
-- Instructors run their own classes that students join by code

-- STEP 1a. Create classes table with foreign key to courses table

CREATE TABLE classes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    instructor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    class_name TEXT NOT NULL,
    join_code TEXT NOT NULL UNIQUE,
    is_general BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
)

-- STEP 1b. Create class members table with foreign keys to classes table and users table

CREATE TABLE class_members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    class_id UUID DEFAULT NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    user_id UUID DEFAULT NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (class_id, user_id)
)

-- STEP 2. Each course gets exactly one 'is_general = true' class owned by admin
-- It is created with the course and enrollment auto-adds membership
-- Create trigger on enrollments insert

CREATE TRIGGER 