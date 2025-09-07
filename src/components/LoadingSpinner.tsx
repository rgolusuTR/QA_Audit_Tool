import React from 'react';
import { Globe, Search, BarChart3, FileText, Wifi, Shield, Code, Database } from 'lucide-react';

interface LoadingSpinnerProps {
  progress: number;
  currentStep: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ progress, currentStep }) => {
  const steps = [
    { icon: Database, label: 'Backend Connection' },
    { icon: Globe, label: 'Fetching webpage' },
    { icon: Code, label: 'Python Processing' },
    { icon: Search, label: 'Link Extraction' },
    { icon: Wifi, label: 'HTTP Validation' },
    { icon: Shield, label: 'Error Analysis' },
    { icon: BarChart3, label: 'Statistics' },
    { icon: FileText, label: 'Report Generation' }
  ];

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <div className="text-center mb-8">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Professional QA Analysis</h3>
          <p className="text-gray-600">{currentStep}</p>
          <div className="mt-2 text-sm text-gray-500">
            {currentStep.includes('PYTHON') && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                <Code className="w-3 h-3 mr-1" />
                Using Python backend with professional libraries
              </span>
            )}
            {currentStep.includes('REQUESTS') && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                <Wifi className="w-3 h-3 mr-1" />
                Making real HTTP requests with Python requests library
              </span>
            )}
            {currentStep.includes('BEAUTIFULSOUP') && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                <FileText className="w-3 h-3 mr-1" />
                Professional HTML parsing with BeautifulSoup
              </span>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {steps.map((step, index) => {
            const StepIcon = step.icon;
            const isCompleted = progress > (index + 1) * (100 / steps.length);
            const isActive = progress >= index * (100 / steps.length) && progress < (index + 1) * (100 / steps.length);

            return (
              <div
                key={index}
                className={`flex flex-col items-center p-3 rounded-lg transition-all duration-200 ${
                  isCompleted
                    ? 'bg-green-50 text-green-600'
                    : isActive
                    ? 'bg-blue-50 text-blue-600'
                    : 'bg-gray-50 text-gray-400'
                }`}
              >
                <StepIcon className={`w-6 h-6 mb-2 ${isActive ? 'animate-pulse' : ''}`} />
                <span className="text-xs text-center font-medium">{step.label}</span>
              </div>
            );
          })}
        </div>

        {/* Backend Information */}
        <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg">
          <div className="flex items-start space-x-3">
            <Database className="w-5 h-5 text-green-600 mt-0.5" />
            <div className="text-sm text-green-800">
              <p className="font-medium mb-1">🐍 Professional Python Backend Analysis</p>
              <p className="text-xs text-green-700 mb-2">⏳ Large websites may take 3-5 minutes for complete analysis</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                <p><strong>✅ requests:</strong> Industry-standard HTTP library</p>
                <p><strong>✅ BeautifulSoup:</strong> Professional HTML parsing</p>
                <p><strong>✅ aiohttp:</strong> Async HTTP client</p>
                <p><strong>✅ FastAPI:</strong> Modern web framework</p>
                <p><strong>✅ validators:</strong> URL validation</p>
                <p><strong>✅ fake-useragent:</strong> User agent rotation</p>
              </div>
              <div className="mt-2 p-2 bg-blue-50 rounded border border-blue-200">
                <p className="text-xs text-blue-800">
                  <strong>⚡ Performance Note:</strong> Analysis time depends on website size, number of links, and server response times. Large e-commerce sites or slow servers may require the full 5-minute timeout.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};