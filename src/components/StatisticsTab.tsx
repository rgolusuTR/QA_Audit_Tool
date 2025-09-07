import React from 'react';
import { Statistics, SEOMetrics } from '../types/seo';
import { 
  BarChart3, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  XCircle,
  Link as LinkIcon,
  Globe,
  Zap
} from 'lucide-react';

interface StatisticsTabProps {
  statistics: Statistics;
  seoMetrics: SEOMetrics;
}

export const StatisticsTab: React.FC<StatisticsTabProps> = ({ statistics, seoMetrics }) => {
  const statusCodeEntries = Object.entries(statistics.status_code_distribution)
    .sort(([a], [b]) => parseInt(a) - parseInt(b));

  const getStatusCodeColor = (code: number) => {
    if (code >= 200 && code < 300) return 'text-green-600 bg-green-50';
    if (code >= 300 && code < 400) return 'text-blue-600 bg-blue-50';
    if (code >= 400 && code < 500) return 'text-yellow-600 bg-yellow-50';
    if (code >= 500) return 'text-red-600 bg-red-50';
    return 'text-gray-600 bg-gray-50';
  };

  const getStatusCodeDescription = (code: number) => {
    const descriptions: Record<number, string> = {
      200: 'OK - Success',
      301: 'Moved Permanently',
      302: 'Found (Temporary Redirect)',
      304: 'Not Modified',
      400: 'Bad Request',
      401: 'Unauthorized',
      403: 'Forbidden',
      404: 'Not Found',
      408: 'Request Timeout',
      429: 'Too Many Requests',
      500: 'Internal Server Error',
      502: 'Bad Gateway',
      503: 'Service Unavailable',
      504: 'Gateway Timeout'
    };
    return descriptions[code] || `HTTP ${code}`;
  };

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Links Analyzed</p>
              <p className="text-3xl font-bold text-blue-600">{statistics.total_links}</p>
            </div>
            <LinkIcon className="w-8 h-8 text-blue-600" />
          </div>
          <div className="mt-2 text-sm text-gray-500">
            Professional link validation completed
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Success Rate</p>
              <p className="text-3xl font-bold text-green-600">{statistics.success_rate.toFixed(1)}%</p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-600" />
          </div>
          <div className="mt-2 text-sm text-gray-500">
            {statistics.working_links} working, {statistics.broken_links} broken
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Average Response Time</p>
              <p className="text-3xl font-bold text-purple-600">{(statistics.avg_response_time * 1000).toFixed(0)}ms</p>
            </div>
            <Clock className="w-8 h-8 text-purple-600" />
          </div>
          <div className="mt-2 text-sm text-gray-500">
            Network performance metric
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Page Load Time</p>
              <p className="text-3xl font-bold text-orange-600">{seoMetrics.load_time.toFixed(2)}s</p>
            </div>
            <Zap className="w-8 h-8 text-orange-600" />
          </div>
          <div className="mt-2 text-sm text-gray-500">
            Initial page fetch time
          </div>
        </div>
      </div>

      {/* Link Distribution */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <BarChart3 className="w-5 h-5 mr-2 text-blue-600" />
          Link Distribution Analysis
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="bg-blue-50 rounded-lg p-4 mb-2">
              <LinkIcon className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-600">{statistics.internal_links}</div>
            </div>
            <div className="text-sm font-medium text-gray-700">Internal Links</div>
            <div className="text-xs text-gray-500">Same domain links</div>
          </div>

          <div className="text-center">
            <div className="bg-purple-50 rounded-lg p-4 mb-2">
              <Globe className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-purple-600">{statistics.external_links}</div>
            </div>
            <div className="text-sm font-medium text-gray-700">External Links</div>
            <div className="text-xs text-gray-500">Cross-domain links</div>
          </div>

          <div className="text-center">
            <div className="bg-green-50 rounded-lg p-4 mb-2">
              <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-600">{statistics.working_links}</div>
            </div>
            <div className="text-sm font-medium text-gray-700">Working Links</div>
            <div className="text-xs text-gray-500">2xx status codes</div>
          </div>

          <div className="text-center">
            <div className="bg-red-50 rounded-lg p-4 mb-2">
              <XCircle className="w-8 h-8 text-red-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-red-600">{statistics.broken_links}</div>
            </div>
            <div className="text-sm font-medium text-gray-700">Broken Links</div>
            <div className="text-xs text-gray-500">4xx/5xx or network errors</div>
          </div>
        </div>
      </div>

      {/* Status Code Distribution */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          HTTP Status Code Distribution
        </h3>
        
        {statusCodeEntries.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {statusCodeEntries.map(([code, count]) => {
              const statusCode = parseInt(code);
              const percentage = ((count / statistics.total_links) * 100).toFixed(1);
              
              return (
                <div
                  key={code}
                  className={`border rounded-lg p-4 ${getStatusCodeColor(statusCode)}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-lg">{code}</span>
                    <span className="font-semibold">{count}</span>
                  </div>
                  <div className="text-sm font-medium mb-1">
                    {getStatusCodeDescription(statusCode)}
                  </div>
                  <div className="text-xs opacity-75">
                    {percentage}% of total links
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>No status code data available</p>
          </div>
        )}
      </div>

      {/* Additional Statistics */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          Additional Analysis Metrics
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-yellow-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-yellow-800">Redirects Found</span>
              <span className="text-2xl font-bold text-yellow-600">{statistics.redirects}</span>
            </div>
            <div className="text-xs text-yellow-700">
              Links that redirect to other URLs
            </div>
          </div>

          <div className="bg-red-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-red-800">Timeout Errors</span>
              <span className="text-2xl font-bold text-red-600">{statistics.timeouts}</span>
            </div>
            <div className="text-xs text-red-700">
              Requests that exceeded timeout limit
            </div>
          </div>

          <div className="bg-orange-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-orange-800">Network Errors</span>
              <span className="text-2xl font-bold text-orange-600">{statistics.network_errors}</span>
            </div>
            <div className="text-xs text-orange-700">
              DNS failures and connection issues
            </div>
          </div>
        </div>
      </div>

      {/* SEO Content Metrics */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          Content & SEO Metrics
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="bg-indigo-50 rounded-lg p-4 mb-2">
              <div className="text-2xl font-bold text-indigo-600">{seoMetrics.word_count.toLocaleString()}</div>
            </div>
            <div className="text-sm font-medium text-gray-700">Total Words</div>
            <div className="text-xs text-gray-500">Content word count</div>
          </div>

          <div className="text-center">
            <div className="bg-green-50 rounded-lg p-4 mb-2">
              <div className="text-2xl font-bold text-green-600">{seoMetrics.images_count}</div>
            </div>
            <div className="text-sm font-medium text-gray-700">Total Images</div>
            <div className="text-xs text-gray-500">{seoMetrics.images_without_alt} missing alt text</div>
          </div>

          <div className="text-center">
            <div className="bg-purple-50 rounded-lg p-4 mb-2">
              <div className="text-2xl font-bold text-purple-600">{seoMetrics.readability_score}</div>
            </div>
            <div className="text-sm font-medium text-gray-700">Readability Score</div>
            <div className="text-xs text-gray-500">Flesch Reading Ease</div>
          </div>

          <div className="text-center">
            <div className="bg-blue-50 rounded-lg p-4 mb-2">
              <div className="text-2xl font-bold text-blue-600">{(seoMetrics.page_size / 1024).toFixed(0)}KB</div>
            </div>
            <div className="text-sm font-medium text-gray-700">Page Size</div>
            <div className="text-xs text-gray-500">HTML content size</div>
          </div>
        </div>
      </div>
    </div>
  );
};