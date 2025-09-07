import React, { useState } from 'react';
import { ErrorsByCategory } from '../types/seo';
import { 
  AlertTriangle, 
  XCircle, 
  Clock, 
  Wifi, 
  RotateCcw,
  CheckCircle,
  Copy,
  ExternalLink
} from 'lucide-react';

interface ErrorCategoriesTabProps {
  errorsByCategory: ErrorsByCategory;
}

export const ErrorCategoriesTab: React.FC<ErrorCategoriesTabProps> = ({ errorsByCategory }) => {
  const [activeCategory, setActiveCategory] = useState('broken_links');
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  const categories = [
    {
      id: 'broken_links',
      label: 'All Broken Links',
      icon: <XCircle className="w-4 h-4" />,
      count: errorsByCategory.broken_links.length,
      color: 'red'
    },
    {
      id: '4xx_errors',
      label: '4xx Client Errors',
      icon: <AlertTriangle className="w-4 h-4" />,
      count: errorsByCategory['4xx_errors'].length,
      color: 'red'
    },
    {
      id: '5xx_errors',
      label: '5xx Server Errors',
      icon: <XCircle className="w-4 h-4" />,
      count: errorsByCategory['5xx_errors'].length,
      color: 'red'
    },
    {
      id: 'network_errors',
      label: 'Network Errors',
      icon: <Wifi className="w-4 h-4" />,
      count: errorsByCategory.network_errors.length,
      color: 'orange'
    },
    {
      id: 'timeouts',
      label: 'Timeouts',
      icon: <Clock className="w-4 h-4" />,
      count: errorsByCategory.timeouts.length,
      color: 'yellow'
    },
    {
      id: 'redirects',
      label: 'Redirects',
      icon: <RotateCcw className="w-4 h-4" />,
      count: errorsByCategory.redirects.length,
      color: 'blue'
    },
    {
      id: 'working_links',
      label: 'Working Links',
      icon: <CheckCircle className="w-4 h-4" />,
      count: errorsByCategory.working_links.length,
      color: 'green'
    }
  ];

  const copyToClipboard = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedUrl(url);
      setTimeout(() => setCopiedUrl(null), 2000);
    } catch (err) {
      console.error('Failed to copy URL:', err);
    }
  };

  const getColorClasses = (color: string) => {
    const colors = {
      red: 'bg-red-100 text-red-700 border-red-300',
      orange: 'bg-orange-100 text-orange-700 border-orange-300',
      yellow: 'bg-yellow-100 text-yellow-700 border-yellow-300',
      blue: 'bg-blue-100 text-blue-700 border-blue-300',
      green: 'bg-green-100 text-green-700 border-green-300'
    };
    return colors[color as keyof typeof colors] || colors.red;
  };

  const getStatusCodeDescription = (statusCode: number | null) => {
    const descriptions: Record<number, string> = {
      400: 'Bad Request - Invalid syntax',
      401: 'Unauthorized - Authentication required',
      403: 'Forbidden - Access denied',
      404: 'Not Found - Resource does not exist',
      408: 'Request Timeout - Server took too long',
      429: 'Too Many Requests - Rate limit exceeded',
      500: 'Internal Server Error - Server malfunction',
      502: 'Bad Gateway - Invalid upstream response',
      503: 'Service Unavailable - Server temporarily down',
      504: 'Gateway Timeout - Upstream server timeout'
    };
    
    return statusCode ? descriptions[statusCode] || `HTTP ${statusCode}` : 'Network Error';
  };

  const currentLinks = errorsByCategory[activeCategory as keyof ErrorsByCategory] || [];

  return (
    <div className="space-y-6">
      {/* Category Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        {categories.map((category) => (
          <div
            key={category.id}
            className={`bg-white rounded-xl shadow-lg p-4 border border-gray-100 cursor-pointer transition-all duration-200 hover:shadow-xl ${
              activeCategory === category.id ? 'ring-2 ring-blue-500' : ''
            }`}
            onClick={() => setActiveCategory(category.id)}
          >
            <div className="flex items-center justify-between mb-2">
              <div className={`p-2 rounded-lg ${getColorClasses(category.color)}`}>
                {category.icon}
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {category.count}
            </div>
            <div className="text-xs text-gray-600 font-medium">
              {category.label}
            </div>
          </div>
        ))}
      </div>

      {/* Category Navigation */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100">
        <div className="border-b border-gray-200">
          <nav className="flex flex-wrap gap-2 p-4" aria-label="Error categories">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`${
                  activeCategory === category.id
                    ? 'bg-blue-100 text-blue-700 border-blue-300'
                    : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                } px-4 py-2 border rounded-lg font-medium text-sm flex items-center space-x-2 transition-all duration-200`}
              >
                {category.icon}
                <span>{category.label}</span>
                <span className="bg-white px-2 py-1 rounded-full text-xs font-semibold">
                  {category.count}
                </span>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {categories.find(c => c.id === activeCategory)?.label} ({currentLinks.length})
          </h3>
          
          {currentLinks.length > 0 ? (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {currentLinks.map((link, index) => {
                const category = categories.find(c => c.id === activeCategory);
                const colorClass = category ? getColorClasses(category.color) : getColorClasses('red');
                
                return (
                  <div key={index} className={`border rounded-lg p-4 ${colorClass}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-3 mb-2">
                          <div className="flex items-center space-x-2">
                            {category?.icon}
                            <span className="font-medium">
                              {link.anchor_text || 'No anchor text'}
                            </span>
                          </div>
                          
                          <span className="bg-white px-2 py-1 rounded text-xs font-semibold">
                            {link.status_code || 'N/A'}
                          </span>
                          
                          <span className="bg-white bg-opacity-50 px-2 py-1 rounded text-xs">
                            {link.method_used}
                          </span>
                          
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            link.link_type === 'internal' 
                              ? 'bg-blue-100 text-blue-800' 
                              : 'bg-purple-100 text-purple-800'
                          }`}>
                            {link.link_type}
                          </span>
                          
                          <span className="text-xs">
                            {(link.response_time * 1000).toFixed(0)}ms
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-2 mb-2">
                          <p className="text-sm break-all font-mono bg-white bg-opacity-50 p-2 rounded flex-1">
                            {link.url}
                          </p>
                          <button
                            onClick={() => copyToClipboard(link.url)}
                            className="p-2 hover:bg-white hover:bg-opacity-50 rounded transition-colors"
                            title="Copy URL"
                          >
                            {copiedUrl === link.url ? (
                              <CheckCircle className="w-4 h-4" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </button>
                          <a
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 hover:bg-white hover:bg-opacity-50 rounded transition-colors"
                            title="Open link"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </div>
                        
                        <div className="text-sm mb-2">
                          <strong>Status:</strong> {getStatusCodeDescription(link.status_code)}
                        </div>
                        
                        {link.content_type && (
                          <div className="text-sm mb-2">
                            <strong>Content Type:</strong> {link.content_type}
                          </div>
                        )}
                        
                        {link.redirect_chain.length > 0 && (
                          <div className="text-sm mb-2">
                            <strong>Redirect Chain:</strong>
                            <div className="mt-1 space-y-1">
                              {link.redirect_chain.map((redirect, i) => (
                                <div key={i} className="font-mono text-xs bg-white bg-opacity-50 p-1 rounded">
                                  {i + 1}. {redirect}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {link.retry_count > 0 && (
                          <div className="text-sm mb-2">
                            <strong>Retries:</strong> {link.retry_count} attempts
                          </div>
                        )}
                        
                        {link.error_message && (
                          <div className="bg-white bg-opacity-70 p-3 rounded text-sm">
                            <strong>Error Details:</strong> {link.error_message}
                          </div>
                        )}
                        
                        <div className="text-xs mt-2 opacity-75">
                          Final URL: {link.final_url}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <div className="text-6xl mb-4">🎉</div>
              <p>No issues found in this category!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};