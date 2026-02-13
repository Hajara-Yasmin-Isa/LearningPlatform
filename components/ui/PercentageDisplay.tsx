import React from 'react';

interface PercentageDisplayProps {
  value: number;
  label?: string;
}

const PercentageDisplay: React.FC<PercentageDisplayProps> = ({ value, label }) => {
  const clampedValue = Math.min(Math.max(value, 0), 100);

  return (
    <div className="w-full max-w-md">
      {/* Label and Percentage Text */}
      <div className="flex justify-between items-center mb-2">
        {label && (
          <span className="text-sm font-medium text-gray-700">
            {label}
          </span>
        )}
        <span className="text-sm font-semibold text-blue-600">
          {clampedValue}%
        </span>
      </div>
      
      {/* Progress Bar Container */}
      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden shadow-inner">
        {/* Progress Bar Fill */}
        <div 
          className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-700 ease-out shadow-sm"
          style={{ width: `${clampedValue}%` }}
        />
      </div>
    </div>
  );
};

export default PercentageDisplay;