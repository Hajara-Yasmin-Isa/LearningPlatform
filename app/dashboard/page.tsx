"use client";

import { useState } from "react";
import DashboardNav from "@/components/features/dashboard/DashboardNav";
import StudentDashboard from "@/components/features/dashboard/StudentDashboard";

import { InstructorDashboard } from "@/components/features/dashboard/InstructorDashboard";

type Role = "Student" | "Instructor";

export default function DashboardPage() {
  const [role, setRole] = useState<Role>("Student");

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNav />

      <main className="max-w-7xl mx-auto px-6 py-8">
        
        {/* Role Selector (Temporary) */}
        <div className="mb-6 flex items-center gap-3">
          <label className="text-sm font-medium text-gray-700">
            View As:
          </label>

          <select
            value={role}
            onChange={(e) => setRole(e.target.value as Role)}
            className="border border-gray-300 rounded-md p-2 text-gray-700 bg-white"
          >
            <option value="Student">Student</option>
            <option value="Instructor">Instructor</option>
          </select>
        </div>

        {/* Conditional Rendering */}
        {role === "Student" && <StudentDashboard />}

        {role === "Instructor" && <InstructorDashboard />}
      </main>
    </div>
  );
}