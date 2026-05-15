'use client';

import { useState } from 'react';
import SectionContent from './SectionContent';
import LessonNav from './LessonNav';
import LessonProgressBar from './LessonProgressBar';
import { markSectionComplete } from '@/lib/supabase/lessons';

interface Section {
  id: string;
  title: string;
  content: string;
  exercises: any[];
}

interface Lesson {
  id: string;
  title: string;
  sections: Section[];
}

interface UserProgress {
  completedSections: string[];
  currentSection?: string;
}

interface LessonViewerProps {
  lesson: Lesson;
  userProgress: UserProgress;
  userId: string;
}

export default function LessonViewer({ lesson, userProgress, userId }: LessonViewerProps) {
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [completedSections, setCompletedSections] = useState<string[]>(
    userProgress.completedSections || []
  );

  const currentSection = lesson.sections[currentSectionIndex];
  const isLastSection = currentSectionIndex === lesson.sections.length - 1;
  const isFirstSection = currentSectionIndex === 0;
  const isCurrentSectionComplete = completedSections.includes(currentSection.id);

  const handlePrevious = () => {
    if (currentSectionIndex > 0) {
      setCurrentSectionIndex(currentSectionIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentSectionIndex < lesson.sections.length - 1) {
      setCurrentSectionIndex(currentSectionIndex + 1);
    }
  };

  const handleFinishChapter = () => {
    window.location.href = `/courses`;
  };

  const handleSectionComplete = async (sectionId: string) => {
    if (!completedSections.includes(sectionId)) {
      setCompletedSections([...completedSections, sectionId]);
      
      try {
        await markSectionComplete(userId, lesson.id, sectionId);
      } catch (error) {
        console.error('Failed to mark section complete:', error);
      }
    }
  };

  const allSectionsComplete = completedSections.length === lesson.sections.length;
  const showChapterComplete = isLastSection && allSectionsComplete;

  if (showChapterComplete) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Chapter Complete!
          </h1>
          <p className="text-gray-600 mb-6">
            Great job! You've completed all sections in this lesson.
          </p>
          <button
            onClick={handleFinishChapter}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
          >
            Back to Course
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 pb-24">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        {lesson.title}
      </h1>

      <SectionContent 
        section={currentSection}
        onComplete={() => handleSectionComplete(currentSection.id)}
        isComplete={isCurrentSectionComplete}
      />

      <LessonNav
        onPrevious={handlePrevious}
        onNext={handleNext}
        isPreviousDisabled={isFirstSection}
        isNextDisabled={!isCurrentSectionComplete}
        isLastSection={isLastSection}
      />

      <LessonProgressBar
        totalSections={lesson.sections.length}
        completedSections={completedSections.length}
      />
    </div>
  );
}