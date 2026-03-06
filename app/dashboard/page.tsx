"use client";

import { useState } from "react";
import DashboardNav from "@/components/features/dashboard/DashboardNav";
import StudentDashboard from "@/components/features/dashboard/StudentDashboard";

type Role = "Student" | "Instructor";

export default function DashboardPage() {
    //useState for Student/Instructor view
    const [role, setRole] = useState<Role>("Student");

    return (
        <div>
            <DashboardNav />

            <div className="max-w-6xl mx-auto p-6">

                {/* Role Selector (Temporary obviously*/}
                <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as Role)}
                    className="border rounded p-2 mb-6"
                >
                    <option value="Student">Student</option>
                    <option value="Instructor">Instructor</option>
                </select>

                {/* Conditional rendering */}
                {role === "Student" && <StudentDashboard />}
            </div>
        </div>
    )
}

