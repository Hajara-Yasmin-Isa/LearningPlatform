// Empty-conversation state. English demo copy only until the Hausa decision.
// TODO: copy — the lead will voice Malami's greeting.

const SUGGESTIONS = [
  'What is a variable?',
  'Explain loops with an example',
  'How does an if statement work?',
]

export default function WelcomeState({
  onSuggestion,
}: {
  onSuggestion: (text: string) => void
}) {
  return (
    <div className="flex h-full flex-col items-center justify-center px-6 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gray-900 text-xl font-semibold text-white">
        M
      </div>
      <h2 className="text-lg font-semibold text-gray-900">Hello, I am Malami</h2>
      <p className="mt-2 max-w-sm text-sm text-gray-600">
        {/* TODO: copy */}
        Ask me anything about computing and I will help you work it out.
      </p>

      <div className="mt-6 flex flex-wrap justify-center gap-2">
        {SUGGESTIONS.map((text) => (
          <button
            key={text}
            type="button"
            onClick={() => onSuggestion(text)}
            className="rounded-full border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-800 hover:bg-gray-50"
          >
            {text}
          </button>
        ))}
      </div>
    </div>
  )
}
