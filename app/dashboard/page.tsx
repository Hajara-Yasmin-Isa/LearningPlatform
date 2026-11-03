import StudentDashboard from "@/components/features/dashboard/StudentDashboard";
import { InstructorDashboard } from "@/components/features/dashboard/InstructorDashboard";
import { getUserRole } from "@/lib/supabase/profile";
import { createServerClient } from "@/lib/supabase/server";
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const supabase = await createServerClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // A failed role lookup must not take the dashboard down with it: fall back
  // to the student view, which is what almost every user needs anyway.
  let isInstructor = false
  try {
    const role = await getUserRole(user.id, supabase)
    isInstructor = role === 'instructor' || role === 'admin'
  } catch {
    isInstructor = false
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-6 py-8">
        {isInstructor ? <InstructorDashboard /> : <StudentDashboard />}
      </main>
    </div>
  );
}
