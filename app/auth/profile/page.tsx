"use client";

import { useEffect, useState } from "react";
import ProfileAvatar from "@/components/features/profile/ProfileAvatar";
import ProfileForm from "@/components/features/profile/ProfileForm";
import { supabase } from "@/lib/supabase/client";

interface ProfileData {
  name: string;
  email: string;
  bio: string;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileData>({
    name: "",
    email: "",
    bio: "",
  });

  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      setProfile({
        name:
          user.user_metadata?.full_name ??
          user.email?.split("@")[0] ??
          "",
        email: user.email ?? "",
        bio: "",
      });
    }

    loadProfile();
  }, []);

  const handleSave = async (updatedData: ProfileData) => {
    setSaving(true);

    try {
      // TODO: Replace with updateUserProfile(name, bio)
      // when Backend Task 3 is merged.
      setProfile(updatedData);
      setIsEditing(false);
    } finally {
      setSaving(false);
    }
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

          <div>
            <h1 className="text-2xl font-bold text-blue-700">
              {profile.name}
            </h1>
          </div>
        </div>

        {/* Form */}
        <ProfileForm
          data={profile}
          isEditing={isEditing}
          saving={saving}
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