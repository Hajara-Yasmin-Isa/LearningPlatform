"use client";

import { useState } from "react";
import ProfileAvatar from "@/components/features/profile/ProfileAvatar";
import ProfileForm from "@/components/features/profile/ProfileForm";


type Role = "Student" | "Instructor";

interface ProfileData {
  name: string;
  email: string;
  bio: string;
  role: Role;
  gradeLevel?: string;
  department?: string;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileData>({
    name: "John Doe",
    email: "john@example.com",
    bio: "Passionate learner and future engineer.",
    role: "Student",
    gradeLevel: "Sophomore",
  });

  const [isEditing, setIsEditing] = useState(false);



  const handleSave = (updatedData: ProfileData) => {
    console.log("Saved profile:", updatedData);
    setProfile(updatedData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto bg-white shadow rounded-lg p-8 space-y-6">

        {/* Header */}
        <div className="flex items-center gap-6">
          <ProfileAvatar size={96} />

          <div className="flex items-center gap text">
            <h1 className="text-2xl font-bold text-blue-700">{profile.name}</h1>
            <span className="inline-block mt-1 px-3 py-1 mx-4 text-sm bg-blue-100 text-blue-700 rounded-full">
              {profile.role}
            </span>
          </div>
        </div>
        {/* TEMPORARY Change Profile Data (to test Instructor role)*/}
        <button
        onClick={() =>
            setProfile((prev) =>
            prev.role === "Student"
                ? {
                    name: "Dr. Smith",
                    email: "smith@example.com",
                    bio: "Teaching advanced software engineering.",
                    role: "Instructor",
                    department: "Computer Science",
                }
                : {
                    name: "John Doe",
                    email: "john@example.com",
                    bio: "Computer Science student.",
                    role: "Student",
                    gradeLevel: "Senior",
                }
            )
        }
        className="mb-4 px-4 py-2 bg-gray-500 rounded hover:bg-black"
        >
        Toggle Role
        </button>

        {/* Form */}
        <ProfileForm
          data={profile}
          isEditing={isEditing}
          onSave={handleSave}
          onCancel={handleCancel}
        />

        {/* Edit Button */}
        {!isEditing && (
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Edit Profile
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
