// Shows a visual progress bar at the bottom of the page
// Calculates progress as: sections completed / total sections
// Example: if there are 5 sections and 2 are done, bar is 40% filled
// Show the label: "2 of 5 sections complete"
// Use green for completed, gray for remaining
// components/features/lessons/LessonProgressBar.tsx

'use client';

interface LessonProgressBarProps {
  totalSections: number;
  completedSections: number;
}

export default function LessonProgressBar({
  totalSections,
  completedSections
}: LessonProgressBarProps) {
  const percentage = (completedSections / totalSections) * 100;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
      <div className="max-w-4xl mx-auto">
        <p className="text-sm text-gray-600 mb-2 text-center">
          {completedSections} of {totalSections} sections complete
        </p>

        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div
            className="bg-green-600 h-full transition-all duration-300"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    </div>
  );
}