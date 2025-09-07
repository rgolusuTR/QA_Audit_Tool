import React from 'react';
import { SEOMetrics, PageProperties } from '../types/seo';
import { 
  FileText, 
  Hash, 
  Image, 
  Globe, 
  Clock, 
  BarChart3,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Settings
} from 'lucide-react';

interface SEOMetricsTabProps {
  seoMetrics: SEOMetrics;
}

export const SEOMetricsTab: React.FC<SEOMetricsTabProps> = ({ seoMetrics }) => {
  const getStatusIcon = (isGood: boolean, isWarning: boolean = false) => {
    if (isGood) return <CheckCircle className="w-5 h-5 text-green-600" />;
    if (isWarning) return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
    return <XCircle className="w-5 h-5 text-red-600" />;
  };

  const getStatusColor = (isGood: boolean, isWarning: boolean = false) => {
    if (isGood) return 'text-green-600 bg-green-50 border-green-200';
    if (isWarning) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getReadabilityLevel = (score: number) => {
    if (score >= 90) return 'Very Easy';
    if (score >= 80) return 'Easy';
    if (score >= 70) return 'Fairly Easy';
    if (score >= 60) return 'Standard';
    if (score >= 50) return 'Fairly Difficult';
    if (score >= 30) return 'Difficult';
    return 'Very Difficult';
  };

  const titleGood = seoMetrics.title_length >= 30 && seoMetrics.title_length <= 65;
  const titleWarning = seoMetrics.title_length > 0 && (seoMetrics.title_length < 30 || seoMetrics.title_length > 65);

  const descGood = seoMetrics.meta_description_length >= 120 && seoMetrics.meta_description_length <= 155;
  const descWarning = seoMetrics.meta_description_length > 0 && (seoMetrics.meta_description_length < 120 || seoMetrics.meta_description_length > 155);

  const h1Good = seoMetrics.h1_tags.length === 1;
  const h1Warning = seoMetrics.h1_tags.length > 1;

  const wordCountGood = seoMetrics.word_count >= 300;
  const imagesGood = seoMetrics.images_without_alt === 0;
  const loadTimeGood = seoMetrics.load_time < 3;
  const loadTimeWarning = seoMetrics.load_time >= 3 && seoMetrics.load_time < 5;

  return (
    <div className="space-y-6">
      {/* Title Analysis */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <FileText className="w-5 h-5 mr-2 text-blue-600" />
          Title Analysis
        </h3>
        
        <div className={`border rounded-lg p-4 ${getStatusColor(titleGood, titleWarning)}`}>
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center space-x-2">
              {getStatusIcon(titleGood, titleWarning)}
              <span className="font-medium">Page Title</span>
            </div>
            <span className="text-sm font-semibold">
              {seoMetrics.title_length} characters
            </span>
          </div>
          
          <p className="text-sm mb-2 font-mono bg-white bg-opacity-50 p-2 rounded">
            {seoMetrics.title || 'No title found'}
          </p>
          
          <div className="text-xs">
            <strong>Recommendation:</strong> {
              titleGood ? 'Title length is optimal (30-65 characters)' :
              seoMetrics.title_length === 0 ? 'Add a descriptive title tag' :
              seoMetrics.title_length < 30 ? 'Consider expanding your title to 30-65 characters' :
              'Consider shortening your title to under 65 characters'
            }
          </div>
        </div>
      </div>

      {/* Meta Description Analysis */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <FileText className="w-5 h-5 mr-2 text-green-600" />
          Meta Description Analysis
        </h3>
        
        <div className={`border rounded-lg p-4 ${getStatusColor(descGood, descWarning)}`}>
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center space-x-2">
              {getStatusIcon(descGood, descWarning)}
              <span className="font-medium">Meta Description</span>
            </div>
            <span className="text-sm font-semibold">
              {seoMetrics.meta_description_length} characters
            </span>
          </div>
          
          <p className="text-sm mb-2 font-mono bg-white bg-opacity-50 p-2 rounded">
            {seoMetrics.meta_description || 'No meta description found'}
          </p>
          
          <div className="text-xs">
            <strong>Recommendation:</strong> {
              descGood ? 'Meta description length is optimal (120-155 characters)' :
              seoMetrics.meta_description_length === 0 ? 'Add a compelling meta description' :
              seoMetrics.meta_description_length < 120 ? 'Consider expanding your meta description to 120-155 characters' :
              'Consider shortening your meta description to under 155 characters'
            }
          </div>
        </div>
      </div>

      {/* Heading Structure */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <Hash className="w-5 h-5 mr-2 text-purple-600" />
          Heading Structure
        </h3>
        
        <div className="space-y-6">
          {/* H1 Tags Analysis */}
          <div className={`border rounded-lg p-4 ${getStatusColor(h1Good, h1Warning)}`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                {getStatusIcon(h1Good, h1Warning)}
                <span className="font-medium">H1 Tags</span>
              </div>
              <span className="text-sm font-semibold">{seoMetrics.h1_tags.length}</span>
            </div>
            <div className="text-xs">
              {h1Good ? 'Perfect! One H1 tag found' :
               seoMetrics.h1_tags.length === 0 ? 'Add exactly one H1 tag' :
               'Use only one H1 tag per page'}
            </div>
            {seoMetrics.h1_tags.length > 0 && (
              <div className="mt-3 space-y-2">
                <div className="text-xs font-medium text-gray-700">H1 Content:</div>
                {seoMetrics.h1_tags.map((h1, index) => (
                  <div key={index} className="bg-white bg-opacity-70 p-2 rounded text-xs">
                    <div className="font-mono text-gray-800 break-words">{h1}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* H2 Tags Analysis */}
          <div className="border border-gray-200 rounded-lg p-4 bg-blue-50">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-blue-800">H2 Tags</span>
              <span className="text-sm font-semibold text-blue-600">{seoMetrics.h2_tags.length}</span>
            </div>
            <div className="text-xs text-blue-700">
              {seoMetrics.h2_tags.length === 0 ? 'No H2 tags found' : 'Good structure for content hierarchy'}
            </div>
            {seoMetrics.h2_tags.length > 0 && (
              <div className="mt-3 space-y-2 max-h-48 overflow-y-auto">
                <div className="text-xs font-medium text-blue-800">H2 Content:</div>
                {seoMetrics.h2_tags.map((h2, index) => (
                  <div key={index} className="bg-white bg-opacity-70 p-2 rounded text-xs">
                    <div className="font-mono text-blue-900 break-words">{h2}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* H3 Tags Analysis */}
          <div className="border border-gray-200 rounded-lg p-4 bg-green-50">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-green-800">H3 Tags</span>
              <span className="text-sm font-semibold text-green-600">{seoMetrics.h3_tags.length}</span>
            </div>
            <div className="text-xs text-green-700">
              {seoMetrics.h3_tags.length === 0 ? 'No H3 tags found' : 'Supports detailed content structure'}
            </div>
            {seoMetrics.h3_tags.length > 0 && (
              <div className="mt-3 space-y-2 max-h-48 overflow-y-auto">
                <div className="text-xs font-medium text-green-800">H3 Content:</div>
                {seoMetrics.h3_tags.map((h3, index) => (
                  <div key={index} className="bg-white bg-opacity-70 p-2 rounded text-xs">
                    <div className="font-mono text-green-900 break-words">{h3}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* H4, H5, H6 Tags Analysis */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* H4 Tags */}
            <div className="border border-gray-200 rounded-lg p-4 bg-yellow-50">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-yellow-800">H4 Tags</span>
                <span className="text-sm font-semibold text-yellow-600">{seoMetrics.h4_tags?.length || 0}</span>
              </div>
              <div className="text-xs text-yellow-700">
                {(seoMetrics.h4_tags?.length || 0) === 0 ? 'No H4 tags found' : 'Sub-section headings'}
              </div>
              {(seoMetrics.h4_tags?.length || 0) > 0 && (
                <div className="mt-3 space-y-1 max-h-32 overflow-y-auto">
                  <div className="text-xs font-medium text-yellow-800">H4 Content:</div>
                  {seoMetrics.h4_tags?.map((h4, index) => (
                    <div key={index} className="bg-white bg-opacity-70 p-1 rounded text-xs">
                      <div className="font-mono text-yellow-900 break-words text-xs">{h4}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* H5 Tags */}
            <div className="border border-gray-200 rounded-lg p-4 bg-purple-50">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-purple-800">H5 Tags</span>
                <span className="text-sm font-semibold text-purple-600">{seoMetrics.h5_tags?.length || 0}</span>
              </div>
              <div className="text-xs text-purple-700">
                {(seoMetrics.h5_tags?.length || 0) === 0 ? 'No H5 tags found' : 'Minor headings'}
              </div>
              {(seoMetrics.h5_tags?.length || 0) > 0 && (
                <div className="mt-3 space-y-1 max-h-32 overflow-y-auto">
                  <div className="text-xs font-medium text-purple-800">H5 Content:</div>
                  {seoMetrics.h5_tags?.map((h5, index) => (
                    <div key={index} className="bg-white bg-opacity-70 p-1 rounded text-xs">
                      <div className="font-mono text-purple-900 break-words text-xs">{h5}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* H6 Tags */}
            <div className="border border-gray-200 rounded-lg p-4 bg-indigo-50">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-indigo-800">H6 Tags</span>
                <span className="text-sm font-semibold text-indigo-600">{seoMetrics.h6_tags?.length || 0}</span>
              </div>
              <div className="text-xs text-indigo-700">
                {(seoMetrics.h6_tags?.length || 0) === 0 ? 'No H6 tags found' : 'Smallest headings'}
              </div>
              {(seoMetrics.h6_tags?.length || 0) > 0 && (
                <div className="mt-3 space-y-1 max-h-32 overflow-y-auto">
                  <div className="text-xs font-medium text-indigo-800">H6 Content:</div>
                  {seoMetrics.h6_tags?.map((h6, index) => (
                    <div key={index} className="bg-white bg-opacity-70 p-1 rounded text-xs">
                      <div className="font-mono text-indigo-900 break-words text-xs">{h6}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Heading Structure Summary */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
              <Hash className="w-4 h-4 mr-2 text-gray-600" />
              Heading Structure Summary
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-center">
              <div className="bg-white rounded p-3">
                <div className="text-lg font-bold text-purple-600">{seoMetrics.h1_tags.length}</div>
                <div className="text-xs text-gray-600">H1 Tags</div>
              </div>
              <div className="bg-white rounded p-3">
                <div className="text-lg font-bold text-blue-600">{seoMetrics.h2_tags.length}</div>
                <div className="text-xs text-gray-600">H2 Tags</div>
              </div>
              <div className="bg-white rounded p-3">
                <div className="text-lg font-bold text-green-600">{seoMetrics.h3_tags.length}</div>
                <div className="text-xs text-gray-600">H3 Tags</div>
              </div>
              <div className="bg-white rounded p-3">
                <div className="text-lg font-bold text-yellow-600">{seoMetrics.h4_tags?.length || 0}</div>
                <div className="text-xs text-gray-600">H4 Tags</div>
              </div>
              <div className="bg-white rounded p-3">
                <div className="text-lg font-bold text-purple-600">{seoMetrics.h5_tags?.length || 0}</div>
                <div className="text-xs text-gray-600">H5 Tags</div>
              </div>
              <div className="bg-white rounded p-3">
                <div className="text-lg font-bold text-indigo-600">{seoMetrics.h6_tags?.length || 0}</div>
                <div className="text-xs text-gray-600">H6 Tags</div>
              </div>
            </div>
            
            {/* Heading Hierarchy Recommendations */}
            <div className="mt-4 p-3 bg-blue-50 rounded border border-blue-200">
              <div className="text-sm text-blue-800">
                <strong>Heading Hierarchy Recommendations:</strong>
                <ul className="mt-2 space-y-1 text-xs">
                  {seoMetrics.h1_tags.length === 0 && (
                    <li>• Add exactly one H1 tag as the main page heading</li>
                  )}
                  {seoMetrics.h1_tags.length > 1 && (
                    <li>• Use only one H1 tag per page for better SEO</li>
                  )}
                  {seoMetrics.h2_tags.length === 0 && (
                    <li>• Consider adding H2 tags for main section headings</li>
                  )}
                  <li>• Maintain proper heading hierarchy (H1 → H2 → H3 → H4 → H5 → H6)</li>
                  <li>• Use headings to structure content logically for users and search engines</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Analysis */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <BarChart3 className="w-5 h-5 mr-2 text-indigo-600" />
          Page Size & Language Analysis
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className={`border rounded-lg p-4 ${getStatusColor(wordCountGood)}`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                {getStatusIcon(wordCountGood)}
                <span className="font-medium">Page Size</span>
              </div>
              <span className="text-sm font-semibold">{(seoMetrics.page_size / 1024).toFixed(1)} KB</span>
            </div>
            <div className="text-xs">
              {seoMetrics.page_size > 1048576 ? 'Large page size - consider optimization' : 'Good page size'}
            </div>
          </div>

          {/*<div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-gray-800">Page Size</span>
              <span className="text-sm font-semibold text-gray-600">
                {(seoMetrics.page_size / 1024).toFixed(1)} KB
              </span>
            </div>
            <div className="text-xs text-gray-700">
              {seoMetrics.page_size > 1048576 ? 'Consider optimizing' : 'Good size'}
            </div>
          </div>*/}

          <div className="border border-gray-200 rounded-lg p-4 bg-blue-50">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-blue-800">Language</span>
              <span className="text-sm font-semibold text-blue-600">{seoMetrics.lang}</span>
            </div>
            <div className="text-xs text-blue-700">
              Detected language
            </div>
          </div>
        </div>
      </div>

      {/* Images and Performance */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <Image className="w-5 h-5 mr-2 text-green-600" />
          Images & Performance
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border border-gray-200 rounded-lg p-4 bg-green-50">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-green-800">Total Images</span>
              <span className="text-sm font-semibold text-green-600">{seoMetrics.images_count}</span>
            </div>
            <div className="text-xs text-green-700">
              Images found on page
            </div>
          </div>

          <div className={`border rounded-lg p-4 ${getStatusColor(imagesGood)}`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                {getStatusIcon(imagesGood)}
                <span className="font-medium">Missing Alt Text</span>
              </div>
              <span className="text-sm font-semibold">{seoMetrics.images_without_alt}</span>
            </div>
            <div className="text-xs">
              {imagesGood ? 'All images have alt text' : 'Add alt text to improve accessibility'}
            </div>
          </div>

          <div className={`border rounded-lg p-4 ${getStatusColor(loadTimeGood, loadTimeWarning)}`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                {getStatusIcon(loadTimeGood, loadTimeWarning)}
                <span className="font-medium">Load Time</span>
              </div>
              <span className="text-sm font-semibold">{seoMetrics.load_time.toFixed(2)}s</span>
            </div>
            <div className="text-xs">
              {loadTimeGood ? 'Fast loading time' :
               loadTimeWarning ? 'Consider optimization' :
               'Slow loading - needs optimization'}
            </div>
          </div>
        </div>
      </div>

      {/* Technical SEO */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <Globe className="w-5 h-5 mr-2 text-blue-600" />
          Technical SEO
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-gray-800">Canonical URL</span>
              <span className="text-xs text-gray-600">
                {seoMetrics.canonical_url ? 'Set' : 'Not Set'}
              </span>
            </div>
            {seoMetrics.canonical_url && (
              <div className="text-xs text-gray-700 font-mono bg-white p-2 rounded break-all">
                {seoMetrics.canonical_url}
              </div>
            )}
            <div className="text-xs mt-2 text-gray-600">
              {seoMetrics.canonical_url ? 'Good for preventing duplicate content' : 'Consider adding canonical URL'}
            </div>
          </div>

          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-gray-800">Meta Robots</span>
              <span className="text-xs text-gray-600">
                {seoMetrics.meta_robots || 'Default'}
              </span>
            </div>
            <div className="text-xs text-gray-700">
              {seoMetrics.meta_robots || 'Using default crawling behavior'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};