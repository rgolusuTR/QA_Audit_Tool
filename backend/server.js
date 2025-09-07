import React from 'react';
import { SEOAuditResult } from '../types/seo';
import { AlertTriangle, CheckCircle, XCircle, Clock, FileText, Image as ImageIcon, Link as LinkIcon, SpellCheck as Spell, TrendingUp, Globe, FormInput, ExternalLink, Target, BarChart3 } from 'lucide-react';

interface OverviewTabProps {
  results: SEOAuditResult;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({ results }) => {
  // Helper function to switch tabs
  const switchToTab = (tabId: string) => {
    const event = new CustomEvent('switchTab', { detail: tabId });
    window.dispatchEvent(event);
  };

  // Calculate overall issues
  const criticalIssues = [];
  const warningIssues = [];
  const infoIssues = [];

  // Critical Issues (Red)
  if (results.statistics.broken_links > 0) {
    criticalIssues.push({
      title: `${results.statistics.broken_links} Broken Links Found`,
      description: 'Links that return 4xx/5xx errors or network failures',
      action: 'Fix broken links immediately',
      tab: 'link-analysis',
      icon: <XCircle className="w-5 h-5 text-red-600" />,
      count: results.statistics.broken_links
    });
  }

  if (!results.seo_metrics?.title || results.seo_metrics.title.length === 0) {
    criticalIssues.push({
      title: 'Missing Page Title',
      description: 'No title tag found on the page',
      action: 'Add a descriptive title tag (30-60 characters)',
      tab: 'seo-metrics',
      icon: <FileText className="w-5 h-5 text-red-600" />
    });
  }

  if (!results.seo_metrics?.meta_description || results.seo_metrics.meta_description.length === 0) {
    criticalIssues.push({
      title: 'Missing Meta Description',
      description: 'No meta description found',
      action: 'Add a compelling meta description (120-160 characters)',
      tab: 'seo-metrics',
      icon: <FileText className="w-5 h-5 text-red-600" />
    });
  }

  if (results.seo_metrics?.load_time && results.seo_metrics.load_time > 5) {
    criticalIssues.push({
      title: 'Very Slow Load Time',
      description: `Page loads in ${results.seo_metrics.load_time.toFixed(2)} seconds`,
      action: 'Optimize page performance immediately',
      tab: 'seo-metrics',
      icon: <Clock className="w-5 h-5 text-red-600" />
    });
  }

  // Warning Issues (Yellow)
  if (results.seo_metrics?.images_without_alt && results.seo_metrics.images_without_alt > 0) {
    warningIssues.push({
      title: `${results.seo_metrics.images_without_alt} Images Missing Alt Text`,
      description: 'Images without alt attributes affect accessibility',
      action: 'Add descriptive alt text to all images',
      tab: 'images',
      icon: <ImageIcon className="w-5 h-5 text-yellow-600" />,
      count: results.seo_metrics.images_without_alt
    });
  }

  if (results.misspellings && results.misspellings.length > 0) {
    warningIssues.push({
      title: `${results.misspellings.length} Spelling Issues Found`,
      description: 'Misspellings can affect credibility and SEO',
      action: 'Review and correct spelling errors',
      tab: 'misspellings',
      icon: <Spell className="w-5 h-5 text-yellow-600" />,
      count: results.misspellings.length
    });
  }

  if (results.seo_metrics?.title_length && (results.seo_metrics.title_length < 30 || results.seo_metrics.title_length > 60)) {
    warningIssues.push({
      title: 'Title Length Not Optimal',
      description: `Title is ${results.seo_metrics.title_length} characters (optimal: 30-60)`,
      action: results.seo_metrics.title_length < 30 ? 'Expand title to 30-60 characters' : 'Shorten title to under 60 characters',
      tab: 'seo-metrics',
      icon: <FileText className="w-5 h-5 text-yellow-600" />
    });
  }

  if (results.seo_metrics?.meta_description_length && results.seo_metrics.meta_description_length > 0 && (results.seo_metrics.meta_description_length < 120 || results.seo_metrics.meta_description_length > 160)) {
    warningIssues.push({
      title: 'Meta Description Length Not Optimal',
      description: `Meta description is ${results.seo_metrics.meta_description_length} characters (optimal: 120-160)`,
      action: results.seo_metrics.meta_description_length < 120 ? 'Expand meta description' : 'Shorten meta description',
      tab: 'seo-metrics',
      icon: <FileText className="w-5 h-5 text-yellow-600" />
    });
  }

  if (results.seo_metrics?.load_time && results.seo_metrics.load_time >= 3 && results.seo_metrics.load_time <= 5) {
    warningIssues.push({
      title: 'Slow Load Time',
      description: `Page loads in ${results.seo_metrics.load_time.toFixed(2)} seconds`,
      action: 'Optimize images, minify CSS/JS, enable compression',
      tab: 'seo-metrics',
      icon: <Clock className="w-5 h-5 text-yellow-600" />
    });
  }

  // PDF Links Issues
  const pdfLinksNeedingTarget = results.pdf_links ? results.pdf_links.filter(pdf => pdf.window_behavior === 'same window').length : 0;
  const brokenPdfLinks = results.pdf_links ? results.pdf_links.filter(pdf => !pdf.is_working).length : 0;

  if (pdfLinksNeedingTarget > 0) {
    infoIssues.push({
      title: `${pdfLinksNeedingTarget} PDF Links Need target="_blank"`,
      description: 'PDF links should open in new window for better UX',
      action: 'Add target="_blank" to PDF links',
      tab: 'images',
      icon: <FileText className="w-5 h-5 text-blue-600" />,
      count: pdfLinksNeedingTarget
    });
  }

  if (brokenPdfLinks > 0) {
    criticalIssues.push({
      title: `${brokenPdfLinks} Broken PDF Links`,
      description: 'PDF files are not accessible',
      action: 'Fix or remove broken PDF links',
      tab: 'images',
      icon: <FileText className="w-5 h-5 text-red-600" />,
      count: brokenPdfLinks
    });
  }

  // Content Quality Issues
  if (results.seo_metrics?.word_count && results.seo_metrics.word_count < 300) {
    warningIssues.push({
      title: 'Low Word Count',
      description: `Page has ${results.seo_metrics.word_count} words (recommended: 300+)`,
      action: 'Add more valuable content to reach 300+ words',
      tab: 'seo-metrics',
      icon: <FileText className="w-5 h-5 text-yellow-600" />
    });
  }

  if (results.seo_metrics?.readability_score && results.seo_metrics.readability_score < 60) {
    warningIssues.push({
      title: 'Low Readability Score',
      description: `Readability score is ${results.seo_metrics.readability_score}/100`,
      action: 'Simplify sentences and improve content structure',
      tab: 'seo-metrics',
      icon: <FileText className="w-5 h-5 text-yellow-600" />
    });
  }

  if (results.seo_metrics?.h1_tags && results.seo_metrics.h1_tags.length === 0) {
    criticalIssues.push({
      title: 'Missing H1 Tag',
      description: 'No H1 heading found on the page',
      action: 'Add exactly one H1 tag as the main heading',
      tab: 'seo-metrics',
      icon: <FileText className="w-5 h-5 text-red-600" />
    });
  } else if (results.seo_metrics?.h1_tags && results.seo_metrics.h1_tags.length > 1) {
    warningIssues.push({
      title: 'Multiple H1 Tags',
      description: `Found ${results.seo_metrics.h1_tags.length} H1 tags (should be 1)`,
      action: 'Use only one H1 tag per page',
      tab: 'seo-metrics',
      icon: <FileText className="w-5 h-5 text-yellow-600" />
    });
  }

  // Technical Issues
  if (results.statistics?.redirects && results.statistics.redirects > 0) {
    infoIssues.push({
      title: `${results.statistics.redirects} Redirects Found`,
      description: 'Redirects can slow down page performance',
      action: 'Review and minimize unnecessary redirects',
      tab: 'error-categories',
      icon: <LinkIcon className="w-5 h-5 text-blue-600" />,
      count: results.statistics.redirects
    });
  }

  if (results.statistics?.timeouts && results.statistics.timeouts > 0) {
    warningIssues.push({
      title: `${results.statistics.timeouts} Timeout Errors`,
      description: 'Some links are responding too slowly',
      action: 'Check server performance and optimize slow resources',
      tab: 'error-categories',
      icon: <Clock className="w-5 h-5 text-yellow-600" />,
      count: results.statistics.timeouts
    });
  }

  if (results.statistics?.network_errors && results.statistics.network_errors > 0) {
    warningIssues.push({
      title: `${results.statistics.network_errors} Network Errors`,
      description: 'Links with DNS or connection issues',
      action: 'Check network connectivity and DNS resolution',
      tab: 'error-categories',
      icon: <Globe className="w-5 h-5 text-yellow-600" />,
      count: results.statistics.network_errors
    });
  }

  if (!results.seo_metrics?.canonical_url) {
    infoIssues.push({
      title: 'Missing Canonical URL',
      description: 'No canonical URL specified',
      action: 'Add canonical URL to prevent duplicate content issues',
      tab: 'seo-metrics',
      icon: <LinkIcon className="w-5 h-5 text-blue-600" />
    });
  }

  // Eloqua Forms Issues
  const eloquaFormsWithMissingData = results.eloqua_form_fields ? results.eloqua_form_fields.filter(form => 
    form.data_elq_id === 'Not Available' || form.data_form_name === 'Not Available'
  ).length : 0;

  if (eloquaFormsWithMissingData > 0) {
    infoIssues.push({
      title: `${eloquaFormsWithMissingData} Eloqua Forms Missing Attributes`,
      description: 'Forms found but missing proper Eloqua tracking attributes',
      action: 'Add missing Eloqua form attributes for proper tracking',
      tab: 'eloqua-forms',
      icon: <FormInput className="w-5 h-5 text-blue-600" />,
      count: eloquaFormsWithMissingData
    });
  }

  const totalIssues = criticalIssues.length + warningIssues.length;
  const overallScore = Math.max(0, 100 - (criticalIssues.length * 15) - (warningIssues.length * 5));

  return (
    <div className="space-y-6">
      {/* Overall Score Card */}
      <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <div className="text-center">
          <div className={`text-6xl font-bold mb-4 ${
            overallScore >= 80 ? 'text-green-600' : 
            overallScore >= 60 ? 'text-yellow-600' : 
            'text-red-600'
          }`}>
            {overallScore}
          </div>
          <h3 className="text-2xl font-semibold text-gray-900 mb-2">Overall SEO Score</h3>
          <p className="text-gray-600 mb-6">
            {overallScore >= 80 ? 'Excellent SEO performance!' :
             overallScore >= 60 ? 'Good SEO with room for improvement' :
             'Needs significant SEO improvements'}
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-blue-600">{results.statistics?.total_links || 0}</div>
              <div className="text-sm text-blue-700">Total Links</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-green-600">{results.statistics?.success_rate?.toFixed(1) || '0'}%</div>
              <div className="text-sm text-green-700">Success Rate</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-purple-600">{results.seo_metrics?.word_count?.toLocaleString() || '0'}</div>
              <div className="text-sm text-purple-700">Word Count</div>
            </div>
            <div className="bg-yellow-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-yellow-600">{results.seo_metrics?.load_time?.toFixed(2) || '0'}s</div>
              <div className="text-sm text-yellow-700">Load Time</div>
            </div>
          </div>
        </div>
      </div>

      {/* W-* Meta Attributes */}
      <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <FileText className="w-5 h-5 mr-2 text-blue-600" />
          W-* Meta Attributes
        </h3>
        
        {results.w_meta_attributes && Object.keys(results.w_meta_attributes).length > 0 && 
         Object.values(results.w_meta_attributes).some(value => value && value !== 'Not Available') ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(results.w_meta_attributes).map(([key, value]) => {
              const displayName = key.replace('w-', '').replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
              const isAvailable = value && value !== 'Not Available';
              
              return (
                <div key={key} className="bg-gray-50 rounded-lg p-4">
                  <div className="text-sm font-medium text-gray-600 mb-1">{displayName}</div>
                  <div className={`text-lg font-semibold ${isAvailable ? 'text-gray-900' : 'text-gray-400'}`}>
                    {value || 'Not Available'}
                  </div>
                  {isAvailable && (
                    <div className="mt-1">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        ✓ Extracted
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="text-center">
              <div className="bg-blue-100 rounded-full p-6 w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                <FileText className="w-12 h-12 text-blue-600" />
              </div>
              <h4 className="text-xl font-semibold text-blue-900 mb-3">W-* Meta Attributes Analysis</h4>
              <p className="text-blue-800 mb-4">
                Analyzing page for w-* meta attributes and content properties...
              </p>
              
              {/* Show what we're looking for */}
              <div className="bg-white rounded-lg p-4 text-left">
                <h5 className="font-semibold text-blue-900 mb-3">Searching for:</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-blue-800">
                  <div>• w-page-type (meta tag or intelligent detection)</div>
                  <div>• w-published-date (article dates, time elements)</div>
                  <div>• w-business-unit (department, division info)</div>
                  <div>• w-sector (industry, category classification)</div>
                  <div>• w-discipline (subject, topic areas)</div>
                  <div>• w-thumbnail-image (OG image, featured images)</div>
                  <div>• w-search-type (search classification)</div>
                  <div>• w-language (content language)</div>
                  <div>• w-page-type-id (page type identifier)</div>
                  <div>• w-business-unit-id (business unit ID)</div>
                  <div>• w-sector-id (sector identifier)</div>
                </div>
              </div>
              
              {/* Show extracted basic properties */}
              {results.w_meta_attributes && (
                <div className="mt-4 bg-white rounded-lg p-4">
                  <h5 className="font-semibold text-blue-900 mb-3">Basic Properties Detected:</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {Object.entries(results.w_meta_attributes).map(([key, value]) => {
                      const displayName = key.replace('w_', '').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                      return (
                        <div key={key} className="text-sm">
                          <span className="font-medium text-blue-800">{displayName}:</span>
                          <span className="ml-2 text-blue-700">{value}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        
        {results.w_meta_attributes?.['w-thumbnail-image'] && results.w_meta_attributes['w-thumbnail-image'] !== 'Not Available' && (
          <div className="mt-4 bg-gray-50 rounded-lg p-4">
            <div className="text-sm font-medium text-gray-600 mb-2">Thumbnail Image</div>
            <div className="flex items-center space-x-3">
              <img 
                src={results.w_meta_attributes['w-thumbnail-image']} 
                alt="Page thumbnail" 
                className="w-16 h-16 object-cover rounded-lg"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
              <div className="text-sm text-gray-700 font-mono break-all">
                {results.w_meta_attributes['w-thumbnail-image']}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Critical Issues */}
      {criticalIssues.length > 0 && (
        <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
          <h3 className="text-xl font-semibold text-red-700 mb-4 flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2" />
            Critical Issues ({criticalIssues.length})
          </h3>
          <div className="space-y-4">
            {criticalIssues.map((issue, index) => (
              <div key={index} className="border-l-4 border-red-500 bg-red-50 p-4 rounded-r-lg">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    {issue.icon}
                    <div>
                      <h4 className="font-semibold text-red-800">{issue.title}</h4>
                      <p className="text-red-700 text-sm mt-1">{issue.description}</p>
                      <p className="text-red-600 text-sm mt-2 font-medium">{issue.action}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => switchToTab(issue.tab)}
                    className="bg-red-600 text-white px-3 py-1 rounded-lg hover:bg-red-700 transition-colors text-sm flex items-center space-x-1"
                  >
                    <span>View Details</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Warning Issues */}
      {warningIssues.length > 0 && (
        <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
          <h3 className="text-xl font-semibold text-yellow-700 mb-4 flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2" />
            Warning Issues ({warningIssues.length})
          </h3>
          <div className="space-y-4">
            {warningIssues.map((issue, index) => (
              <div key={index} className="border-l-4 border-yellow-500 bg-yellow-50 p-4 rounded-r-lg">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    {issue.icon}
                    <div>
                      <h4 className="font-semibold text-yellow-800">{issue.title}</h4>
                      <p className="text-yellow-700 text-sm mt-1">{issue.description}</p>
                      <p className="text-yellow-600 text-sm mt-2 font-medium">{issue.action}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => switchToTab(issue.tab)}
                    className="bg-yellow-600 text-white px-3 py-1 rounded-lg hover:bg-yellow-700 transition-colors text-sm flex items-center space-x-1"
                  >
                    <span>View Details</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PDF Links Analysis */}
      {results.pdf_links && results.pdf_links.length > 0 && (
        <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
          <h3 className="text-xl font-semibold text-blue-700 mb-4 flex items-center">
            <FileText className="w-5 h-5 mr-2" />
            PDF Links Analysis ({results.pdf_links.length} PDFs)
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{results.pdf_links.length}</div>
              <div className="text-sm text-blue-700">Total PDFs</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-600">
                {results.pdf_links.filter(pdf => pdf.window_behavior === 'new window').length}
              </div>
              <div className="text-sm text-green-700">New Window</div>
            </div>
            <div className="bg-yellow-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600">{pdfLinksNeedingTarget}</div>
              <div className="text-sm text-yellow-700">Need target="_blank"</div>
            </div>
            <div className="bg-red-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-red-600">{brokenPdfLinks}</div>
              <div className="text-sm text-red-700">Broken PDFs</div>
            </div>
          </div>

          <button
            onClick={() => switchToTab('images')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <FileText className="w-4 h-4" />
            <span>View Detailed PDF Analysis</span>
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Information & Optimization Opportunities */}
      {infoIssues.length > 0 && (
        <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
          <h3 className="text-xl font-semibold text-blue-700 mb-4 flex items-center">
            <Target className="w-5 h-5 mr-2" />
            Optimization Opportunities ({infoIssues.length})
          </h3>
          <div className="space-y-4">
            {infoIssues.map((issue, index) => (
              <div key={index} className="border-l-4 border-blue-500 bg-blue-50 p-4 rounded-r-lg">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    {issue.icon}
                    <div>
                      <h4 className="font-semibold text-blue-800">{issue.title}</h4>
                      <p className="text-blue-700 text-sm mt-1">{issue.description}</p>
                      <p className="text-blue-600 text-sm mt-2 font-medium">{issue.action}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => switchToTab(issue.tab)}
                    className="bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 transition-colors text-sm flex items-center space-x-1"
                  >
                    <span>View Details</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Eloqua Forms Summary */}
      {results.eloqua_form_fields && results.eloqua_form_fields.length > 0 && (
        <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
          <h3 className="text-xl font-semibold text-green-700 mb-4 flex items-center">
            <FormInput className="w-5 h-5 mr-2" />
            Eloqua Forms Analysis ({results.eloqua_form_fields.length} form{results.eloqua_form_fields.length !== 1 ? 's' : ''})
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{results.eloqua_form_fields.length}</div>
              <div className="text-sm text-green-700">Forms Found</div>
            </div>
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">
                {results.eloqua_form_fields.filter(form => form.data_elq_id && form.data_elq_id !== 'Not Available').length}
              </div>
              <div className="text-sm text-blue-700">With Eloqua ID</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">
                {results.eloqua_form_fields.filter(form => form.data_form_name && form.data_form_name !== 'Not Available').length}
              </div>
              <div className="text-sm text-purple-700">With Form Name</div>
            </div>
          </div>

          {/* Display first few forms preview */}
          <div className="space-y-3 mb-4">
            {results.eloqua_form_fields.slice(0, 3).map((form, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-900">Form {form.form_index}</span>
                  <div className="flex space-x-2">
                    {form.data_elq_id && form.data_elq_id !== 'Not Available' && (
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">
                        Has Eloqua ID
                      </span>
                    )}
                    {form.hidden_fields && form.hidden_fields.length > 0 && (
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                        {form.hidden_fields.length} Hidden Fields
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-sm text-gray-700">
                  <strong>Form Name:</strong> {form.data_form_name}
                </div>
                <div className="text-sm text-gray-700">
                  <strong>Eloqua ID:</strong> {form.data_elq_id}
                </div>
                <div className="text-sm text-gray-700">
                  <strong>Redirect Page:</strong> {form.data_redirect_page}
                </div>
                <div className="text-sm text-gray-700">
                  <strong>Analytics Name:</strong> {form.data_analytics_name}
                </div>
              </div>
            ))}
            {results.eloqua_form_fields.length > 3 && (
              <div className="text-center text-sm text-gray-500">
                +{results.eloqua_form_fields.length - 3} more forms
              </div>
            )}
          </div>

          <button
            onClick={() => switchToTab('eloqua-forms')}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
          >
            <FormInput className="w-4 h-4" />
            <span>View Eloqua Details</span>
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Success State */}
      {totalIssues === 0 && (
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 text-center">
          <div className="text-green-500 mb-4">
            <CheckCircle className="w-16 h-16 mx-auto" />
          </div>
          <h3 className="text-2xl font-semibold text-gray-900 mb-2">Excellent SEO Performance!</h3>
          <p className="text-gray-600 mb-6">
            No critical issues found. Your website follows SEO best practices.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-green-50 rounded-lg p-4">
              <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <div className="text-sm font-medium text-green-800">All Links Working</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <div className="text-sm font-medium text-green-800">SEO Optimized</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <div className="text-sm font-medium text-green-800">Fast Loading</div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <BarChart3 className="w-5 h-5 mr-2 text-purple-600" />
          Quick Actions
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={() => switchToTab('seo-metrics')}
            className="bg-blue-50 border border-blue-200 rounded-lg p-4 hover:bg-blue-100 transition-colors text-left"
          >
            <FileText className="w-6 h-6 text-blue-600 mb-2" />
            <div className="font-medium text-blue-800">SEO Metrics</div>
            <div className="text-xs text-blue-600">Title, meta, headings</div>
          </button>
          
          <button
            onClick={() => switchToTab('link-analysis')}
            className="bg-green-50 border border-green-200 rounded-lg p-4 hover:bg-green-100 transition-colors text-left"
          >
            <LinkIcon className="w-6 h-6 text-green-600 mb-2" />
            <div className="font-medium text-green-800">Link Analysis</div>
            <div className="text-xs text-green-600">{results.statistics?.total_links || 0} links checked</div>
          </button>
          
          <button
            onClick={() => switchToTab('images')}
            className="bg-purple-50 border border-purple-200 rounded-lg p-4 hover:bg-purple-100 transition-colors text-left"
          >
            <ImageIcon className="w-6 h-6 text-purple-600 mb-2" />
            <div className="font-medium text-purple-800">Images & PDFs</div>
            <div className="text-xs text-purple-600">{results.image_analysis?.length || 0} images, {results.pdf_links?.length || 0} PDFs</div>
          </button>
          
          <button
            onClick={() => switchToTab('misspellings')}
            className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 hover:bg-yellow-100 transition-colors text-left"
          >
            <Spell className="w-6 h-6 text-yellow-600 mb-2" />
            <div className="font-medium text-yellow-800">Spelling</div>
            <div className="text-xs text-yellow-600">{results.misspellings?.length || 0} issues found</div>
          </button>
        </div>
      </div>
    </div>
  );
};