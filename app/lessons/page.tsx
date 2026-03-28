import PercentageDisplay from '../../components/ui/PercentageDisplay';

export default function LessonsPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">My Lessons</h1>
        
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Overall Course Progress
          </h2>
          <PercentageDisplay 
            value={45} 
            label="Total Completion" 
          />
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Introduction to React
            </h3>
            <PercentageDisplay value={100} label="Completed" />
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              React Hooks & State
            </h3>
            <PercentageDisplay value={75} label="In Progress" />
          </div>
        </div>
      </div>
    </div>
  );
}