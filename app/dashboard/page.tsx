import StudentDashboard from "@/components/features/dashboard/StudentDashboard";
import { InstructorDashboard } from "@/components/features/dashboard/InstructorDashboard";
import { createServerClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createServerClient();

  const { data: { user } } = await supabase.auth.getUser();

  let role: string | null = null;
  if (user) {
    const { data } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();
    role = data?.role ?? null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-6 py-8">
        {role === "instructor" ? <InstructorDashboard /> : <StudentDashboard />}
      </main>
    </div>
  );
}
