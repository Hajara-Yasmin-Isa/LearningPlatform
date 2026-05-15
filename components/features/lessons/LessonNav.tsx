// Previous button — goes to previous section (disabled on first section)
// Next button — goes to next section
// Next is disabled until the current section's exercises are all answered
// On the last section, Next becomes "Finish Chapter"
// components/features/lessons/LessonNav.tsx

'use client';

interface LessonNavProps {
  onPrevious: () => void;
  onNext: () => void;
  isPreviousDisabled: boolean;
  isNextDisabled: boolean;
  isLastSection: boolean;
}

export default function LessonNav({
  onPrevious,
  onNext,
  isPreviousDisabled,
  isNextDisabled,
  isLastSection
}: LessonNavProps) {
  return (
    <div className="flex justify-between items-center mb-6">
      <button
        onClick={onPrevious}
        disabled={isPreviousDisabled}
        className={`px-6 py-2 rounded-lg font-medium transition ${
          isPreviousDisabled
            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
            : 'bg-blue-600 text-white hover:bg-blue-700'
        }`}
      >
        ← Previous
      </button>

      <button
        onClick={onNext}
        disabled={isNextDisabled}
        className={`px-6 py-2 rounded-lg font-medium transition ${
          isNextDisabled
            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
            : 'bg-blue-600 text-white hover:bg-blue-700'
        }`}
      >
        {isLastSection ? 'Finish Chapter →' : 'Next →'}
      </button>
    </div>
  );
}