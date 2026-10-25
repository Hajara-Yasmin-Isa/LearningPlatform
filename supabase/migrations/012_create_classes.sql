-- Students who enroll in a course always land in that course's **general class**
-- Instructors run their own classes that students join by code

-- STEP 1a. Create classes table with foreign key to courses table

-- NOTE: Admins can also own classes, so does instructor_id implicitly also allow admins?
--       Do we want ON DELETE CASCADE to still persist even if it's an admin's class?

CREATE TABLE classes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    instructor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    join_code TEXT NOT NULL UNIQUE,
    is_general BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- STEP 1b. Create class members table with foreign keys to classes table and users table

CREATE TABLE class_members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (class_id, user_id)
);

-- STEP 2. Each course gets exactly one 'is_general = true' class owned by admin
-- Enforce uniqueness only for rows where 'is_general = true'
-- Only PREVENTS a course from having more than one class. Below will look to create the one general class per course.
CREATE UNIQUE INDEX one_general_class_per_course
ON classes (course_id)
where is_general = true;

-- It is created with the course and enrollment auto-adds membership
-- Create trigger that creates general class when course is created
-- Create trigger that fires on enrollments insert

CREATE TRIGGER on_course_insertion
    AFTER INSERT ON courses
    BEGIN



CREATE TRIGGER on_enrollment_insert_add_class_member
AFTER INSERT ON enrollments