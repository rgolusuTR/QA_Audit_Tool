import React from 'react';
import { PerformanceMetrics } from '../types/seo';
import { 
  Clock, 
  Globe, 
  FileText, 
  Link as LinkIcon, 
  Image, 
  Zap, 
  Smartphone, 
  Monitor,
  Gauge
} from 'lucide-react';

interface PerformanceMetricsTabProps {
  performanceMetrics: PerformanceMetrics;
}

export const PerformanceMetricsTab: React.FC<PerformanceMetricsTabProps> = ({ performanceMetrics }) => {
  const getLoadTimeColor = (loadTime: number) => {
    if (loadTime < 2000) return 'text-green-600';
    if (loadTime < 4000) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getReadabilityColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-blue-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getReadabilityLabel = (score: number) => {
    if (score >= 90) return 'Very Easy';
    if (score >= 80) return 'Easy';
    if (score >= 70) return 'Fairly Easy';
    if (score >= 60) return 'Standard';
    if (score >= 50) return 'Fairly Difficult';
    if (score >= 30) return 'Difficult';
    return 'Very Difficult';
  };

  const metrics = [
    {
      title: 'Load Times',
      icon: <Clock className="w-6 h-6" />,
      items: [
        {
          label: 'Mobile Load Time',
          value: `${(performanceMetrics.mobileLoadTime / 1000).toFixed(2)}s`,
          color: getLoadTimeColor(performanceMetrics.mobileLoadTime),
          icon: <Smartphone className="w-4 h-4" />
        },
        {
          label: 'Desktop Load Time',
          value: `${(performanceMetrics.desktopLoadTime / 1000).toFixed(2)}s`,
          color: getLoadTimeColor(performanceMetrics.desktopLoadTime),
          icon: <Monitor className="w-4 h-4" />
        }
      ]
    },
    {
      title: 'Content Analysis',
      icon: <FileText className="w-6 h-6" />,
      items: [
        {
          label: 'Language',
          value: performanceMetrics.detectedLanguage,
          color: 'text-gray-700',
          icon: <Globe className="w-4 h-4" />
        },
        {
          label: 'Exact Word Count',
          value: performanceMetrics.exactWordCount.toLocaleString(),
          color: performanceMetrics.exactWordCount < 300 ? 'text-red-600' : 'text-green-600',
          icon: <FileText className="w-4 h-4" />
        },
        {
          label: 'Readability Score',
          value: `${performanceMetrics.readabilityScore}/100`,
          color: getReadabilityColor(performanceMetrics.readabilityScore),
          icon: <Gauge className="w-4 h-4" />
        },
        {
          label: 'Reading Level',
          value: getReadabilityLabel(performanceMetrics.readabilityScore),
          color: getReadabilityColor(performanceMetrics.readabilityScore),
          icon: <FileText className="w-4 h-4" />
        }
      ]
    },
    {
      title: 'Technical Metrics',
      icon: <Zap className="w-6 h-6" />,
      items: [
        {
          label: 'GZIP Compression',
          value: performanceMetrics.gzipEnabled ? 'Enabled' : 'Disabled',
          color: performanceMetrics.gzipEnabled ? 'text-green-600' : 'text-red-600',
          icon: <Zap className="w-4 h-4" />
        },
        {
          label: 'Page Size',
          value: `${(performanceMetrics.pageSize / 1024).toFixed(1)} KB`,
          color: performanceMetrics.pageSize > 1048576 ? 'text-red-600' : 'text-green-600',
          icon: <FileText className="w-4 h-4" />
        },
        {
          label: 'Text-to-Code Ratio',
          value: `${performanceMetrics.textToCodeRatio}%`,
          color: performanceMetrics.textToCodeRatio < 15 ? 'text-red-600' : 'text-green-600',
          icon: <Gauge className="w-4 h-4" />
        },
        {
          label: 'Navigation Depth',
          value: `${performanceMetrics.navigationDepth} levels`,
          color: performanceMetrics.navigationDepth > 5 ? 'text-red-600' : 'text-green-600',
          icon: <Globe className="w-4 h-4" />
        }
      ]
    },
    {
      title: 'Link Analysis',
      icon: <LinkIcon className="w-6 h-6" />,
      items: [
        {
          label: 'Total Links',
          value: performanceMetrics.totalLinks.toString(),
          color: 'text-gray-700',
          icon: <LinkIcon className="w-4 h-4" />
        },
        {
          label: 'Working Links',
          value: performanceMetrics.workingLinks.toString(),
          color: 'text-green-600',
          icon: <LinkIcon className="w-4 h-4" />
        },
        {
          label: 'Internal Links',
          value: performanceMetrics.internalLinks.toString(),
          color: 'text-blue-600',
          icon: <LinkIcon className="w-4 h-4" />
        },
        {
          label: 'External Links',
          value: performanceMetrics.externalLinks.toString(),
          color: 'text-purple-600',
          icon: <LinkIcon className="w-4 h-4" />
        },
        {
          label: 'HTTP Links',
          value: performanceMetrics.httpLinks.toString(),
          color: performanceMetrics.httpLinks > 0 ? 'text-red-600' : 'text-green-600',
          icon: <LinkIcon className="w-4 h-4" />
        },
        {
          label: 'HTTPS Links',
          value: performanceMetrics.httpsLinks.toString(),
          color: 'text-green-600',
          icon: <LinkIcon className="w-4 h-4" />
        },
        {
          label: 'Redirects',
          value: performanceMetrics.redirectCount.toString(),
          color: performanceMetrics.redirectCount > 10 ? 'text-red-600' : 'text-yellow-600',
          icon: <LinkIcon className="w-4 h-4" />
        },
        {
          label: 'Third-Party Domains',
          value: performanceMetrics.thirdPartyDomains.toString(),
          color: 'text-gray-700',
          icon: <Globe className="w-4 h-4" />
        }
      ]
    },
    {
      title: 'Image Analysis',
      icon: <Image className="w-6 h-6" />,
      items: [
        {
          label: 'Total Images',
          value: performanceMetrics.totalImages.toString(),
          color: 'text-gray-700',
          icon: <Image className="w-4 h-4" />
        },
        {
          label: 'Images Over 1MB',
          value: performanceMetrics.imagesOver1MB.toString(),
          color: performanceMetrics.imagesOver1MB > 0 ? 'text-red-600' : 'text-green-600',
          icon: <Image className="w-4 h-4" />
        },
        {
          label: 'Total File Size',
          value: `${(performanceMetrics.totalFileSize / 1024 / 1024).toFixed(1)} MB`,
          color: performanceMetrics.totalFileSize > 10485760 ? 'text-red-600' : 'text-green-600',
          icon: <FileText className="w-4 h-4" />
        },
        {
          label: 'Compression Ratio',
          value: `${performanceMetrics.compressionRatio}%`,
          color: performanceMetrics.compressionRatio > 50 ? 'text-green-600' : 'text-yellow-600',
          icon: <Zap className="w-4 h-4" />
        }
      ]
    }
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
          <Gauge className="w-6 h-6 mr-2 text-blue-600" />
          Performance Metrics Dashboard
        </h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
          {metrics.map((section, sectionIndex) => (
            <div key={sectionIndex} className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <span className="text-blue-600 mr-2">{section.icon}</span>
                {section.title}
              </h3>
              
              <div className="space-y-4">
                {section.items.map((item, itemIndex) => (
                  <div key={itemIndex} className="bg-white rounded-lg p-4 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-500">{item.icon}</span>
                        <span className="text-sm font-medium text-gray-700">{item.label}</span>
                      </div>
                      <span className={`font-semibold ${item.color}`}>
                        {item.value}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Performance Summary */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-blue-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {((performanceMetrics.mobileLoadTime + performanceMetrics.desktopLoadTime) / 2000).toFixed(1)}s
            </div>
            <div className="text-sm text-blue-700">Average Load Time</div>
          </div>
          
          <div className="bg-green-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {performanceMetrics.workingLinks}
            </div>
            <div className="text-sm text-green-700">Working Links</div>
          </div>
          
          <div className="bg-purple-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {performanceMetrics.exactWordCount.toLocaleString()}
            </div>
            <div className="text-sm text-purple-700">Exact Words</div>
          </div>
          
          <div className="bg-yellow-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {performanceMetrics.readabilityScore}
            </div>
            <div className="text-sm text-yellow-700">Readability Score</div>
          </div>
        </div>
      </div>
    </div>
  );
};