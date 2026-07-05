import { getLessonWithSections } from "@/lib/supabase/lessons";
import { createServerClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import { isUserEnrolled } from "@/lib/supabase/courses";
export default async function LessonsPage({
  params, 
}: { params: Promise<{ id: string }> 
}) {
  const { id } = await params;
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser()
  
      if (!user) {
        redirect('/auth/login')
      }
      const lesson = await getLessonWithSections(id)
      if (!lesson) {
        notFound()
      }
      const courseId = (lesson as typeof lesson & { course_id: string }).course_id
      const enrolled = await isUserEnrolled(user.id, courseId)
      if (!enrolled) {
        redirect(`/courses/${courseId}?message=enroll-first`)
      }
      return (
    <div>
      <h1>Lessons</h1>
    </div>
  );
}