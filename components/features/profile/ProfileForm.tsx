"use client";

import { useState } from "react";
import { updateUserProfile } from "@/lib/supabase/profile";


export interface ProfileData {
  name: string
  email: string
  bio: string
}

interface ProfileFormProps {
  initialName: string
  initialBio: string
  email: string
}

export default function ProfileForm({
  initialName,
  initialBio,
  email,
}: ProfileFormProps) {
  const [formData, setFormData] = useState<ProfileData>({
    name: initialName,
    email,
    bio: initialBio,
  });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  //handleChange function
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setSuccess(false);
    setError(null);
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  //Validate function to check if form is valid before submitting
  const validate = () => {
    if (!formData.name.trim()) {
      setError("Name is required.");
      return false;
    }
    return true;
  };

  const handleSaveClick = async () => {
    if (!validate()) return;
    setError(null);
    setSuccess(false);
    try {
      setSaving(true);
      await updateUserProfile(formData.name, formData.bio);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  }
    
  return (
    <form className="space-y-6"
      onSubmit={(e) => {
        e.preventDefault();
        handleSaveClick();
      }}
      >
      {/* Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Name
        </label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          disabled={saving}
          className="mt-1 w-full border rounded px-3 py-2 disabled:bg-gray-100 text-gray-700"
        />
      </div>

      {/* Email */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Email
        </label>
        <p className = "mt-1 text-gray-600">{email}</p>
        </div>


      {/* Bio */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Bio
        </label>
        <textarea
          name="bio"
          value={formData.bio}
          onChange={handleChange}
          disabled={saving}
          rows={4}
          className="mt-1 w-full border rounded px-3 py-2 disabled:bg-gray-100 text-gray-700"
        />
      </div>
      {error && (
        <p className="text-red-500">
          {error}
        </p>
      )}

      {success && (
        <p className="text-green-600">
          Profile updated.
          </p>
      )}
<div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
    </form>
  );
}
