import StudentDashboard from "@/components/features/dashboard/StudentDashboard";

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-6 py-8">
        <StudentDashboard />
      </main>
    </div>
  );
}
