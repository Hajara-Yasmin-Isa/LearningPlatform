import { getAllPublishedCourses, getUserEnrollments } from '@/lib/supabase/courses';
import { getCurrentUser } from '@/lib/supabase/auth';
import { CourseGrid } from '@/components/features/courses/CourseGrid';
import { Suspense } from 'react';

// Loading skeleton for the courses
function CoursesSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="bg-gray-300 h-48 rounded-lg mb-4"></div>
          <div className="bg-gray-300 h-6 rounded mb-2"></div>
          <div className="bg-gray-300 h-4 rounded w-3/4"></div>
        </div>
      ))}
    </div>
  );
}

// Main content component
async function CoursesContent() {
  try {
    // Fetch all published courses
    const courses = await getAllPublishedCourses();
    
    // Get current user
    const user = await getCurrentUser();
    
    // Get user's enrollments
    const enrollments = user ? await getUserEnrollments(user.id) : [];
    
    // Convert enrollments to courseIds for easier checking
    const enrolledCourseIds = enrollments.map((enrollment: any) => enrollment.course_id);

    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-4xl font-bold text-white mb-4">
              Explore Courses
            </h1>
            <p className="text-gray-300 text-lg max-w-2xl">
              Choose from our collection of interactive coding courses and start learning today.
            </p>
          </div>

          {/* Courses Grid */}
          <CourseGrid 
            courses={courses} 
            enrolledCourseIds={enrolledCourseIds}
            userId={user?.id}
          />
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error fetching courses:', error);
    
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-4">
              Error Loading Courses
            </h1>
            <p className="text-gray-300 mb-6">
              Sorry, we couldn't load the courses. Please try again later.
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }
}

// Main page component
export default function CoursesPage() {
  return (
    <Suspense fallback={<CoursesPageSkeleton />}>
      <CoursesContent />
    </Suspense>
  );
}

// Skeleton for the entire page
function CoursesPageSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-12">
          <div className="h-10 bg-gray-300 rounded w-1/3 mb-4 animate-pulse"></div>
          <div className="h-6 bg-gray-300 rounded w-2/3 animate-pulse"></div>
        </div>
        <CoursesSkeleton />
      </div>
    </div>
  );
}