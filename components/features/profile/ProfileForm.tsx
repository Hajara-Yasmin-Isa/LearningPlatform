"use client";

import { useState, useEffect } from "react";

type Role = "Student" | "Instructor";

export interface ProfileData {
  name: string;
  email: string;
  bio: string;
  role: Role;
  gradeLevel?: string;
  department?: string;
}

interface ProfileFormProps {
  data: ProfileData;
  isEditing: boolean;
  onSave: (updatedData: ProfileData) => void;
  onCancel: () => void;
}

export default function ProfileForm({
  data,
  isEditing,
  onSave,
  onCancel,
}: ProfileFormProps) {
  const [formData, setFormData] = useState<ProfileData>(data);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Sync when parent data changes
  useEffect(() => {
    setFormData(data);
  }, [data]);

  //handleChange function
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  //Validate function to check if form is valid before submitting
  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    if (formData.role === "Student" && !formData.gradeLevel?.trim()) {
      newErrors.gradeLevel = "Grade level is required";
    }

    if (formData.role === "Instructor" && !formData.department?.trim()) {
      newErrors.department = "Department is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveClick = () => {
    if (!validate()) return;
    onSave(formData);
  };

  const handleCancelClick = () => {
    setFormData(data); // revert to original
    setErrors({});
    onCancel();
  };

  return (
    <div className="space-y-6">
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
          disabled={!isEditing}
          className="mt-1 w-full border rounded px-3 py-2 disabled:bg-gray-100 text-gray-700"
        />
        {errors.name && (
          <p className="text-sm text-red-500 mt-1 ">{errors.name}</p>
        )}
      </div>

      {/* Email */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Email
        </label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          disabled={!isEditing}
          className="mt-1 w-full border rounded px-3 py-2 disabled:bg-gray-100 text-gray-700"
        />
        {errors.email && (
          <p className="text-sm text-red-500 mt-1">{errors.email}</p>
        )}
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
          disabled={!isEditing}
          rows={4}
          className="mt-1 w-full border rounded px-3 py-2 disabled:bg-gray-100 text-gray-700"
        />
      </div>

      {/* Role (display only) */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Role
        </label>
        <input
          type="text"
          value={formData.role}
          disabled
          className="mt-1 w-full border rounded px-3 py-2 bg-gray-100 text-gray-700"
        />
      </div>

      {/* Role-specific fields */}
      {formData.role === "Student" && (
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Grade Level
          </label>
          <input
            type="text"
            name="gradeLevel"
            value={formData.gradeLevel || ""}
            onChange={handleChange}
            disabled={!isEditing}
            className="mt-1 w-full border rounded px-3 py-2 disabled:bg-gray-100 text-gray-700"
          />
          {errors.gradeLevel && (
            <p className="text-sm text-red-500 mt-1">
              {errors.gradeLevel}
            </p>
          )}
        </div>
      )}

      {formData.role === "Instructor" && (
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Department
          </label>
          <input
            type="text"
            name="department"
            value={formData.department || ""}
            onChange={handleChange}
            disabled={!isEditing}
            className="mt-1 w-full border rounded px-3 py-2 disabled:bg-gray-100 text-gray-700"
          />
          {errors.department && (
            <p className="text-sm text-red-500 mt-1">
              {errors.department}
            </p>
          )}
        </div>
      )}

      {/* Editing Controls */}
      {isEditing && (
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={handleCancelClick}
            className="px-4 py-2 border rounded text-gray-700 hover:bg-red-100"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSaveClick}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Save
          </button>
        </div>
      )}
    </div>
  );
}
