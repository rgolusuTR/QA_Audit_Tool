import React from 'react';
import { AlertCircle, AlertTriangle, Info, Code, TrendingUp, TrendingDown, FileText } from 'lucide-react';

interface ErrorItem {
  type: 'critical' | 'warning' | 'suggestion';
  message: string;
  recommendation: string;
  element?: string;
  value?: string | number;
  context?: string;
}

interface ErrorListProps {
  title: string;
  errors: ErrorItem[];
}

export const ErrorList: React.FC<ErrorListProps> = ({ title, errors }) => {
  const getIcon = (type: string) => {
    switch (type) {
      case 'critical':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getBorderColor = (type: string) => {
    switch (type) {
      case 'critical':
        return 'border-l-red-500';
      case 'warning':
        return 'border-l-yellow-500';
      default:
        return 'border-l-blue-500';
    }
  };

  const getBackgroundColor = (type: string) => {
    switch (type) {
      case 'critical':
        return 'bg-red-50';
      case 'warning':
        return 'bg-yellow-50';
      default:
        return 'bg-blue-50';
    }
  };

  const getPriorityIcon = (type: string) => {
    switch (type) {
      case 'critical':
        return <TrendingUp className="w-4 h-4 text-red-500" />;
      case 'warning':
        return <TrendingDown className="w-4 h-4 text-yellow-500" />;
      default:
        return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  if (errors.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">{title}</h3>
        <div className="text-center py-8">
          <div className="text-green-500 mb-2">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-gray-500">No issues found in this category!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-gray-900">
          {title}
        </h3>
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-500">({errors.length})</span>
          <div className="flex items-center space-x-1">
            {errors.filter(e => e.type === 'critical').length > 0 && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                {errors.filter(e => e.type === 'critical').length} Critical
              </span>
            )}
            {errors.filter(e => e.type === 'warning').length > 0 && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                {errors.filter(e => e.type === 'warning').length} Warning
              </span>
            )}
            {errors.filter(e => e.type === 'suggestion').length > 0 && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {errors.filter(e => e.type === 'suggestion').length} Suggestion
              </span>
            )}
          </div>
        </div>
      </div>
      
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {errors.map((error, index) => (
          <div
            key={index}
            className={`border-l-4 ${getBorderColor(error.type)} pl-4 py-3 ${getBackgroundColor(error.type)} rounded-r-lg transition-all duration-200 hover:shadow-md`}
          >
            <div className="flex items-start space-x-3">
              <div className="flex items-center space-x-2">
                {getIcon(error.type)}
                {getPriorityIcon(error.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium text-gray-900">
                    {error.message}
                  </p>
                  {error.value && (
                    <span className="text-xs font-semibold text-gray-600 bg-white px-2 py-1 rounded">
                      {error.value}
                    </span>
                  )}
                </div>
                
                {error.element && (
                  <div className="flex items-center text-xs text-gray-600 mb-2">
                    <Code className="w-3 h-3 mr-1" />
                    <code className="bg-gray-200 px-2 py-1 rounded text-xs font-mono">
                      {error.element.length > 80 ? `${error.element.substring(0, 80)}...` : error.element}
                    </code>
                  </div>
                )}

                {error.context && (
                  <div className="flex items-center text-xs text-gray-600 mb-2">
                    <FileText className="w-3 h-3 mr-1" />
                    <span className="bg-gray-100 px-2 py-1 rounded text-xs">
                      Context: {error.context.length > 60 ? `${error.context.substring(0, 60)}...` : error.context}
                    </span>
                  </div>
                )}
                
                <div className="bg-white bg-opacity-70 p-2 rounded text-xs text-gray-700 leading-relaxed">
                  <strong>Recommendation:</strong> {error.recommendation}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};