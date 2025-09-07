import React from 'react';

interface ScoreCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: 'red' | 'yellow' | 'blue' | 'green';
  suffix?: string;
}

export const ScoreCard: React.FC<ScoreCardProps> = ({ title, value, icon, color, suffix = '' }) => {
  const colorClasses = {
    red: 'bg-red-50 border-red-200 text-red-700',
    yellow: 'bg-yellow-50 border-yellow-200 text-yellow-700',
    blue: 'bg-blue-50 border-blue-200 text-blue-700',
    green: 'bg-green-50 border-green-200 text-green-700'
  };

  const iconClasses = {
    red: 'text-red-600',
    yellow: 'text-yellow-600',
    blue: 'text-blue-600',
    green: 'text-green-600'
  };

  return (
    <div className={`bg-white rounded-2xl shadow-lg p-6 border-2 ${colorClasses[color]} transition-all duration-200 hover:shadow-xl`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold">
            {value}{suffix}
          </p>
        </div>
        <div className={iconClasses[color]}>
          {icon}
        </div>
      </div>
    </div>
  );
};