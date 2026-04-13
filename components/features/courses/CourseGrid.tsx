import { CourseWithInstructor, Enrollment } from "@/types/database";
import { CourseCard } from './CourseCard'

interface CourseGridProps {
    courses: CourseWithInstructor[]
    enrollments: Enrollment[]
    userId: string | null
}

export function CourseGrid({ courses, enrollments, userId}: CourseGridProps) {

    // Empty state (Cant find the courses or Courses are 0)
  if (courses.length === 0) {
    return (
      <p className="text-center text-gray-500 mt-10">
        No courses available yet — check back soon!
      </p>
    )
  }
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {courses.map((course) => {
        // Check if this course is in user's enrollments
        const isEnrolled = enrollments.some(
          (enrollment) => enrollment.course_id === course.id
        )

        return (
          <CourseCard
            key={course.id}
            course={course}
            isEnrolled={isEnrolled}
            userId={userId}
          />
        )
      })}
    </div>
  )
}