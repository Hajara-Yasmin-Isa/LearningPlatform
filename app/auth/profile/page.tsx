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

  const handleAvatarUpload = async (file: File) => {
  console.log(file)
}

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto bg-white shadow rounded-lg p-8 space-y-6">

        {/* Header */}
        <div className="flex items-center gap-6">
          <ProfileAvatar
              url={undefined} // Replace with actual avatar URL if available
              name={profile.name}
              onUpload={handleAvatarUpload}
            />

          <div className="flex items-center gap text">
            <h1 className="text-2xl font-bold text-blue-700">{profile.name}</h1>
            <span className="inline-block mt-1 px-3 py-1 mx-4 text-sm bg-blue-100 text-blue-700 rounded-full">
              {profile.role}
            </span>
          </div>
        </div>
        {/* Form */}
        <ProfileForm
          initialName={profile.name}
          initialBio={profile.bio}
          email={profile.email}
        />

      </div>
    </div>
  )
}