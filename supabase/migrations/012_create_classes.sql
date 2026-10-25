-- Students who enroll in a course always land in that course's **general class**
-- Instructors run their own classes that students join by code

-- STEP 1a. Create classes table with foreign key to courses table

--==================================================================================================
-- IMPORTANT: Admins can also own classes, so does instructor_id implicitly also allow admins?
--            Do we want ON DELETE CASCADE to still persist even if it's an admin's class?
--==================================================================================================
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

-- General class is created with the course and enrollment auto-adds membership
-- Create trigger that creates general class when course is created
-- Create trigger that fires on enrollments insert

-- Create function to create general class

--====================================================================================
-- IMPORTANT: How do we generate join_code? Should we have a naming convention?
--====================================================================================
CREATE OR REPLACE FUNCTION create_general_class()
RETURNS TRIGGER
AS $$
BEGIN
    INSERT INTO classes (course_id, instructor_id, name, join_code, is_general)
    VALUES (
        NEW.id,
        NEW.instructor_id,
        'General Class',
        '',
        true
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create function to add enrollments to their respective general class
CREATE OR REPLACE FUNCTION add_enrollment_to_general_class()
RETURNS TRIGGER
AS $$
DECLARE
    general_class_id UUID;
BEGIN
    -- Find the general class for this enrollment's course
    SELECT id
    INTO general_class_id
    FROM classes
    WHERE course_id = NEW.course_id
      AND is_general = true;

    -- Don't silently accept an enrollment without a general class
    IF general_class_id IS NULL THEN
        RAISE EXCEPTION 'No general class found for course %', NEW.course_id;
    END IF;

    -- Add the student to that class
    INSERT INTO class_members (class_id, user_id)
    VALUES (general_class_id, NEW.user_id)
    ON CONFLICT (class_id, user_id) DO NOTHING;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for creating general class on course insertion 
CREATE TRIGGER on_course_insertion
    AFTER INSERT ON courses
    EXECUTE FUNCTION create_general_class();

-- Create trigger for adding new enrollments to general class
CREATE TRIGGER on_enrollment_insert_add_class_member
    AFTER INSERT ON enrollments
    FOR EACH ROW
    EXECUTE FUNCTION add_enrollment_to_general_class();