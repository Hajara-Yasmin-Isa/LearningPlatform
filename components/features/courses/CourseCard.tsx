'use client';

import { useState } from 'react';
import { enrollInCourse } from '@/lib/supabase/courses';
import Image from 'next/image';

interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail_url?: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  duration?: number;
  instructor_id: string;
  instructor_name?: string;
}

interface CourseCardProps {
  course: Course;
  isEnrolled: boolean;
  userId?: string;
}

const difficultyColors = {
  Beginner: 'bg-green-500 text-white',
  Intermediate: 'bg-yellow-500 text-black',
  Advanced: 'bg-red-500 text-white',
};

export function CourseCard({ course, isEnrolled, userId }: CourseCardProps) {
  const [loading, setLoading] = useState(false);
  const [enrolled, setEnrolled] = useState(isEnrolled);
  const [showMessage, setShowMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const handleEnroll = async () => {
    if (!userId) {
      setShowMessage({
        type: 'error',
        text: 'Please log in to enroll in courses',
      });
      return;
    }

    if (enrolled) {
      setShowMessage({
        type: 'error',
        text: 'You are already enrolled in this course',
      });
      return;
    }

    setLoading(true);

    try {
      await enrollInCourse(userId, course.id);
      setEnrolled(true);
      setShowMessage({
        type: 'success',
        text: 'Successfully enrolled in course!',
      });

      setTimeout(() => setShowMessage(null), 3000);
    } catch (error) {
      console.error('Enrollment error:', error);
      setShowMessage({
        type: 'error',
        text: 'Failed to enroll. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300 flex flex-col h-full">
      {/* Thumbnail */}
      <div className="relative h-48 w-full bg-gray-700 overflow-hidden group">
        {course.thumbnail_url ? (
          <Image
            src={course.thumbnail_url}
            alt={course.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
            <span className="text-white text-4xl">📚</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6 flex flex-col flex-grow">
        {/* Title */}
        <h3 className="text-xl font-bold text-white mb-2 line-clamp-2">
          {course.title}
        </h3>

        {/* Description */}
        <p className="text-gray-300 text-sm mb-4 line-clamp-2 flex-grow">
          {course.description}
        </p>

        {/* Difficulty Badge */}
        <div className="flex items-center gap-3 mb-4">
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold ${
              difficultyColors[course.difficulty]
            }`}
          >
            {course.difficulty}
          </span>
          {course.duration && (
            <span className="text-gray-400 text-xs">
              ⏱️ {course.duration} hours
            </span>
          )}
        </div>

        {/* Instructor */}
        {course.instructor_name && (
          <p className="text-gray-400 text-sm mb-4">
            👨‍🏫 {course.instructor_name}
          </p>
        )}

        {/* Message Display */}
        {showMessage && (
          <div
            className={`mb-4 p-2 rounded text-sm text-center ${
              showMessage.type === 'success'
                ? 'bg-green-500 text-white'
                : 'bg-red-500 text-white'
            }`}
          >
            {showMessage.text}
          </div>
        )}

        {/* Button */}
        {enrolled ? (
          <button
            disabled
            className="w-full bg-green-600 text-white font-bold py-2 px-4 rounded-lg transition opacity-75 cursor-default"
          >
            ✓ Enrolled
          </button>
        ) : (
          <button
            onClick={handleEnroll}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded-lg transition duration-200"
          >
            {loading ? 'Enrolling...' : 'Enroll Now'}
          </button>
        )}
      </div>
    </div>
  );
}