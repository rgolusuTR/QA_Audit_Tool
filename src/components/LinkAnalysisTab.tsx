import React, { useState } from 'react';
import { LinkResult, Statistics } from '../types/seo';
import { 
  Link as LinkIcon, 
  CheckCircle, 
  XCircle, 
  ExternalLink, 
  Clock,
  Filter,
  Copy,
  BarChart3
} from 'lucide-react';

interface LinkAnalysisTabProps {
  linkResults: LinkResult[];
  statistics: Statistics;
}

export const LinkAnalysisTab: React.FC<LinkAnalysisTabProps> = ({ linkResults, statistics }) => {
  const [filter, setFilter] = useState<'all' | 'working' | 'broken' | 'internal' | 'external'>('all');
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  const getFilteredLinks = () => {
    switch (filter) {
      case 'working':
        return linkResults.filter(link => link.is_working);
      case 'broken':
        return linkResults.filter(link => !link.is_working);
      case 'internal':
        return linkResults.filter(link => link.link_type === 'internal');
      case 'external':
        return linkResults.filter(link => link.link_type === 'external');
      default:
        return linkResults;
    }
  };

  const copyToClipboard = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedUrl(url);
      setTimeout(() => setCopiedUrl(null), 2000);
    } catch (err) {
      console.error('Failed to copy URL:', err);
    }
  };

  const getStatusBadge = (link: LinkResult) => {
    if (link.is_working) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircle className="w-3 h-3 mr-1" />
          {link.status_code}
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <XCircle className="w-3 h-3 mr-1" />
          {link.status_code || 'Error'}
        </span>
      );
    }
  };

  const getMethodBadge = (method: string) => {
    const colors = {
      'HEAD': 'bg-blue-100 text-blue-700',
      'GET': 'bg-green-100 text-green-700',
      'ASYNC_HEAD': 'bg-purple-100 text-purple-700',
      'ASYNC_GET': 'bg-indigo-100 text-indigo-700'
    };
    return colors[method as keyof typeof colors] || 'bg-gray-100 text-gray-700';
  };

  const filteredLinks = getFilteredLinks();

  return (
    <div className="space-y-6">
      {/* Statistics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Links</p>
              <p className="text-3xl font-bold text-blue-600">{statistics.total_links}</p>
            </div>
            <LinkIcon className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Working Links</p>
              <p className="text-3xl font-bold text-green-600">{statistics.working_links}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Broken Links</p>
              <p className="text-3xl font-bold text-red-600">{statistics.broken_links}</p>
            </div>
            <XCircle className="w-8 h-8 text-red-600" />
          </div>
        </div>

        {/*<div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Success Rate</p>
              <p className="text-3xl font-bold text-purple-600">{statistics.success_rate.toFixed(1)}%</p>
            </div>
            <BarChart3 className="w-8 h-8 text-purple-600" />
          </div>
        </div>*/}

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Response</p>
              <p className="text-3xl font-bold text-yellow-600">{(statistics.avg_response_time * 1000).toFixed(0)}ms</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-600" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Filter links:</span>
          </div>
          
          <div className="flex space-x-2">
            {[
              { id: 'all', label: 'All Links', count: statistics.total_links },
              { id: 'working', label: 'Working', count: statistics.working_links },
              { id: 'broken', label: 'Broken', count: statistics.broken_links },
              { id: 'internal', label: 'Internal', count: statistics.internal_links },
              { id: 'external', label: 'External', count: statistics.external_links }
            ].map((option) => (
              <button
                key={option.id}
                onClick={() => setFilter(option.id as any)}
                className={`${
                  filter === option.id
                    ? 'bg-blue-100 text-blue-700 border-blue-300'
                    : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                } px-3 py-2 border rounded-lg text-sm font-medium transition-all duration-200`}
              >
                {option.label} ({option.count})
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Links List */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Link Analysis Results ({filteredLinks.length} links)
          </h3>
          
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {filteredLinks.map((link, index) => (
              <div
                key={index}
                className={`border rounded-lg p-4 ${
                  link.is_working
                    ? 'border-green-200 bg-green-50'
                    : 'border-red-200 bg-red-50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="flex items-center space-x-2">
                        {link.is_working ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-600" />
                        )}
                        <span className="font-medium text-gray-900">
                          {link.anchor_text || 'No anchor text'}
                        </span>
                      </div>
                      
                      {getStatusBadge(link)}
                      
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getMethodBadge(link.method_used)}`}>
                        {link.method_used}
                      </span>
                      
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        link.link_type === 'internal' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-purple-100 text-purple-800'
                      }`}>
                        {link.link_type}
                      </span>
                      
                      <span className="text-xs text-gray-500">
                        {(link.response_time * 1000).toFixed(0)}ms
                      </span>
                      
                      {link.retry_count > 0 && (
                        <span className="text-xs text-orange-600">
                          {link.retry_count} retries
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2 mb-2">
                      <p className="text-sm text-gray-700 break-all font-mono bg-white bg-opacity-50 p-2 rounded flex-1">
                        {link.url}
                      </p>
                      <button
                        onClick={() => copyToClipboard(link.url)}
                        className="p-2 text-gray-600 hover:text-gray-800 hover:bg-white hover:bg-opacity-50 rounded transition-colors"
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
                        className="p-2 text-gray-600 hover:text-gray-800 hover:bg-white hover:bg-opacity-50 rounded transition-colors"
                        title="Open link"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                    
                    {link.content_type && (
                      <p className="text-xs text-gray-600 mb-2">
                        <strong>Content Type:</strong> {link.content_type}
                      </p>
                    )}
                    
                    {link.redirect_chain.length > 0 && (
                      <div className="text-xs text-gray-600 mb-2">
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
                    
                    {link.error_message && (
                      <div className="bg-red-100 border border-red-200 rounded p-2 text-sm text-red-700">
                        <strong>Error:</strong> {link.error_message}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};