// Displays the section title and content (text/markdown)
// Below the content, renders the exercises for that section 
// (import the ExerciseBlock component from your partner's card — use a placeholder for now)
// A section is only considered "done" when all exercises in it are answered
// components/features/lessons/SectionContent.tsx
'use client';

interface Section {
  id: string;
  title: string;
  content: string;
  exercises: any[];
}

interface SectionContentProps {
  section: Section;
  onComplete: () => void;
  isComplete?: boolean;
}

export default function SectionContent({ section, onComplete, isComplete }: SectionContentProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">
        {section.title}
      </h2>

      <div className="prose max-w-none mb-6">
        <div className="whitespace-pre-wrap text-gray-700">
          {section.content}
        </div>
      </div>

      {section.exercises && section.exercises.length > 0 ? (
        <div className="border-t pt-4">
          <h3 className="font-semibold mb-2">Exercises:</h3>
          <p className="text-gray-500 italic">
            Exercises will appear here (ExerciseBlock from partner's card)
          </p>
          {/* TODO: When your partner provides ExerciseBlock component, use it here */}
        </div>
      ) : (
        <div className="text-center">
          {isComplete ? (
            <div className="flex items-center justify-center gap-2 text-green-600">
              <span className="text-2xl">✓</span>
              <span className="font-semibold">Section Complete</span>
            </div>
          ) : (
            <button
              onClick={onComplete}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
            >
              Mark Section Complete
            </button>
          )}
        </div>
      )}
    </div>
  );
}