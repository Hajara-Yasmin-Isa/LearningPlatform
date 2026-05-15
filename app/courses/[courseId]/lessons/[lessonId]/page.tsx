import LessonViewer from '@/components/features/lessons/LessonViewer';
import { getLessonWithSections, getUserProgress } from '@/lib/supabase/lessons';
import { auth } from '@clerk/nextjs';
import { redirect } from 'next/navigation';

export default async function LessonPage({ 
  params 
}: { 
  params: { courseId: string; lessonId: string } 
}) {
  // Get the authenticated user
  const { userId } = auth();
  
  // Redirect to login if not authenticated
  if (!userId) {
    redirect('/sign-in');
  }
  
  // Fetch lesson data from database
  const lessonData = await getLessonWithSections(params.lessonId);
  
  // Fetch user's progress from database
  const userProgress = await getUserProgress(userId, params.lessonId);
  
  // Handle case where lesson doesn't exist
  if (!lessonData) {
    redirect('/courses'); // or wherever you want to redirect
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <LessonViewer 
        lesson={lessonData}
        userProgress={userProgress}
        userId={userId}
      />
    </div>
  );
}