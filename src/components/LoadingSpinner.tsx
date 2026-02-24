import React from 'react';
import { Globe, Search, BarChart3, FileText, Wifi, Shield, Code, CheckCircle } from 'lucide-react';

interface LoadingSpinnerProps {
  progress: number;
  currentStep: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ progress, currentStep }) => {
  const steps = [
    { icon: Globe, label: 'Fetching webpage' },
    { icon: Code, label: 'Parsing HTML' },
    { icon: Search, label: 'SEO Analysis' },
    { icon: Wifi, label: 'Link Validation' },
    { icon: FileText, label: 'Image Analysis' },
    { icon: Shield, label: 'Spell Check' },
    { icon: BarChart3, label: 'Readability' },
    { icon: CheckCircle, label: 'Report Generation' }
  ];

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <div className="text-center mb-8">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Professional QA Analysis</h3>
          <p className="text-gray-600">{currentStep}</p>
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

        {/* Client-Side Information */}
        <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg">
          <div className="flex items-start space-x-3">
            <Globe className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">🌐 Client-Side Browser Analysis</p>
              <p className="text-xs text-blue-700 mb-2">⚡ Fast analysis running directly in your browser</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                <p><strong>✅ SEO Analysis:</strong> Meta tags, titles, headings</p>
                <p><strong>✅ Link Checking:</strong> Internal & external links</p>
                <p><strong>✅ Image Optimization:</strong> Alt text, dimensions</p>
                <p><strong>✅ Spell Checking:</strong> Content validation</p>
                <p><strong>✅ Readability:</strong> Flesch Reading Ease score</p>
                <p><strong>✅ No Backend:</strong> All processing in browser</p>
              </div>
              <div className="mt-2 p-2 bg-yellow-50 rounded border border-yellow-200">
                <p className="text-xs text-yellow-800">
                  <strong>⚠️ CORS Note:</strong> Some websites may block cross-origin requests. For best results, use publicly accessible websites or sites with permissive CORS policies.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};