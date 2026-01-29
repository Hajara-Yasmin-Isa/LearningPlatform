export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="max-w-4xl w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">
            🚀 Learning Platform
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Language-First Computing Education
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-semibold mb-4">Welcome to v0 Alpha</h2>
          <p className="mb-4">
            This is the starting point for our collaborative learning platform.
          </p>
          
          <div className="space-y-4">
            <div className="border-l-4 border-blue-500 pl-4">
              <h3 className="font-semibold">✅ Setup Complete</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                If you can see this page, your development environment is working!
              </p>
            </div>

            <div className="border-l-4 border-yellow-500 pl-4">
              <h3 className="font-semibold">📋 Next Steps</h3>
              <ol className="text-sm text-gray-600 dark:text-gray-400 list-decimal list-inside space-y-1">
                <li>Check your assigned Trello card</li>
                <li>Create a feature branch for your task</li>
                <li>Start coding!</li>
              </ol>
            </div>

            <div className="border-l-4 border-green-500 pl-4">
              <h3 className="font-semibold">📚 Resources</h3>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li>• Review the Student Onboarding Guide</li>
                <li>• Check README.md for workflow details</li>
                <li>• Ask questions in Slack</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="text-center text-sm text-gray-500">
          <p>Remember: Mistakes are expected. Silent confusion is not.</p>
        </div>
      </div>
    </main>
  )
}

