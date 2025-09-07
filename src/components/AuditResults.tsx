import React, { useState } from 'react';
import { SEOAuditResult } from '../types/seo';
import { TabNavigation } from './TabNavigation';
import { SEOMetricsTab } from './SEOMetricsTab';
import { OverviewTab } from './OverviewTab';
import { MisspellingsTab } from './MisspellingsTab';
import { ImageTab } from './ImageTab';
import { LinkAnalysisTab } from './LinkAnalysisTab';
import { ErrorCategoriesTab } from './ErrorCategoriesTab';
import { EloquaFormFieldsTab } from './EloquaFormFieldsTab';
import { BarChart3, Link as LinkIcon, AlertTriangle, TrendingUp, FileText, SpellCheck as Spell, Image as ImageIcon, FormInput } from 'lucide-react';

interface AuditResultsProps {
  results: SEOAuditResult;
  onNewAudit: () => void;
}

export const AuditResults: React.FC<AuditResultsProps> = ({ results, onNewAudit }) => {
  const [activeTab, setActiveTab] = useState('overview');

  // Add event listener for tab switching from overview links
  React.useEffect(() => {
    const handleTabSwitch = (event: CustomEvent) => {
      setActiveTab(event.detail);
    };

    window.addEventListener('switchTab', handleTabSwitch as EventListener);
    return () => {
      window.removeEventListener('switchTab', handleTabSwitch as EventListener);
    };
  }, []);

  // Store the audited URL for responsiveness testing
  React.useEffect(() => {
    if (results?.url) {
      // Store in multiple places for reliability
      sessionStorage.setItem('auditedUrl', results.url);
      localStorage.setItem('lastAuditedUrl', results.url);
      (window as any).currentAuditUrl = results.url;
    }
  }, [results?.url]);

  const tabs = [
    {
      id: 'overview',
      label: 'Overview',
      icon: <BarChart3 className="w-4 h-4" />,
      count: results.statistics.total_links
    },
    {
      id: 'seo-metrics',
      label: 'Meta titles & Headings',
      icon: <FileText className="w-4 h-4" />
    },
    {
      id: 'images',
      label: 'Asset Analysis & Responsiveness',
      icon: <ImageIcon className="w-4 h-4" />,
      // count: results.image_analysis?.length || 0
    },
    {
      id: 'link-analysis',
      label: 'Link Analysis',
      icon: <LinkIcon className="w-4 h-4" />,
      count: results.statistics?.broken_links || 0
    },
    {
      id: 'eloqua-forms',
      label: 'Eloqua Forms',
      icon: <FormInput className="w-4 h-4" />,
      count: results.eloqua_form_fields?.length || 0
    }
  ];

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Enhanced QA Audit Results</h2>
            <p className="text-gray-600 break-all">{results.url}</p>
            <p className="text-sm text-gray-500 mt-1">
              Analyzed on {results.timestamp} using Enhanced Python Backend
            </p>
            <div className="flex items-center mt-2 space-x-4">
              <div className="flex items-center text-sm text-gray-600">
                <span>Language: {results.seo_metrics?.lang || 'Unknown'}</span>
              </div>
              {/*<div className="flex items-center text-sm text-gray-600">
                <span>Words: {results.seo_metrics?.word_count?.toLocaleString() || '0'}</span>
              </div>*/}
              <div className="flex items-center text-sm text-gray-600">
                <span>Load Time: {results.seo_metrics?.load_time?.toFixed(2) || '0'}s</span>
              </div>
              {/*<div className="flex items-center text-sm text-gray-600">
                <span>Success Rate: {results.statistics?.success_rate?.toFixed(1) || '0'}%</span>
              </div>*/}
            </div>
          </div>
          <div className="mt-4 md:mt-0">
            <button
              onClick={onNewAudit}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              New Audit
            </button>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <TabNavigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
        tabs={tabs}
      />

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <OverviewTab results={results} />
      )}

      {activeTab === 'seo-metrics' && (
        <SEOMetricsTab seoMetrics={results.seo_metrics} />
      )}


      {activeTab === 'images' && (
        <ImageTab 
          imageAnalysis={results.image_analysis || []} 
          responsivenessTests={results.responsiveness_tests || []}
          pdfLinks={results.pdf_links || []}
          auditedUrl={results.url}
        />
      )}

      {activeTab === 'link-analysis' && (
        <LinkAnalysisTab 
          linkResults={results.link_results || []}
          statistics={results.statistics || {}}
        />
      )}


      {activeTab === 'eloqua-forms' && (
        <EloquaFormFieldsTab eloquaFormFields={results.eloqua_form_fields || []} />
      )}
    </div>
  );
};