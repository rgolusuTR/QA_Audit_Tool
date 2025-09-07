import React, { useState } from 'react';
import { ThirdPartyLink } from '../types/seo';
import { ExternalLink, CheckCircle, XCircle, Clock, Filter } from 'lucide-react';

interface ThirdPartyLinksTabProps {
  thirdPartyLinks: ThirdPartyLink[];
}

export const ThirdPartyLinksTab: React.FC<ThirdPartyLinksTabProps> = ({ thirdPartyLinks }) => {
  const [filter, setFilter] = useState<'all' | 'working' | 'broken'>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const workingLinks = thirdPartyLinks.filter(link => link.isWorking);
  const brokenLinks = thirdPartyLinks.filter(link => !link.isWorking);

  const getFilteredLinks = () => {
    let filtered = thirdPartyLinks;
    
    if (filter === 'working') {
      filtered = workingLinks;
    } else if (filter === 'broken') {
      filtered = brokenLinks;
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(link => link.type === typeFilter);
    }

    return filtered;
  };

  const linkTypes = [...new Set(thirdPartyLinks.map(link => link.type))];

  const getTypeIcon = (type: string) => {
    const icons: Record<string, string> = {
      social: '👥',
      cdn: '🌐',
      analytics: '📊',
      advertising: '📢',
      payment: '💳',
      other: '🔗'
    };
    return icons[type] || '🔗';
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      social: 'bg-blue-100 text-blue-800',
      cdn: 'bg-green-100 text-green-800',
      analytics: 'bg-purple-100 text-purple-800',
      advertising: 'bg-yellow-100 text-yellow-800',
      payment: 'bg-indigo-100 text-indigo-800',
      other: 'bg-gray-100 text-gray-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Third-Party Links</p>
              <p className="text-3xl font-bold text-gray-900">{thirdPartyLinks.length}</p>
            </div>
            <ExternalLink className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Working Links</p>
              <p className="text-3xl font-bold text-green-600">{workingLinks.length}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Broken Links</p>
              <p className="text-3xl font-bold text-red-600">{brokenLinks.length}</p>
            </div>
            <XCircle className="w-8 h-8 text-red-600" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Filter by status:</span>
          </div>
          
          <div className="flex space-x-2">
            {[
              { id: 'all', label: 'All Links', count: thirdPartyLinks.length },
              { id: 'working', label: 'Working', count: workingLinks.length },
              { id: 'broken', label: 'Broken', count: brokenLinks.length }
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

          <div className="flex items-center space-x-2 ml-4">
            <span className="text-sm font-medium text-gray-700">Filter by type:</span>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              {linkTypes.map(type => (
                <option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Links List */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Third-Party Links ({getFilteredLinks().length})
          </h3>
          
          <div className="space-y-4">
            {getFilteredLinks().map((link, index) => (
              <div
                key={index}
                className={`border rounded-lg p-4 ${
                  link.isWorking
                    ? 'border-green-200 bg-green-50'
                    : 'border-red-200 bg-red-50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="flex items-center space-x-2">
                        {link.isWorking ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-600" />
                        )}
                        <span className="font-medium">
                          {link.anchor || 'No anchor text'}
                        </span>
                      </div>
                      
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(link.type)}`}>
                        {getTypeIcon(link.type)} {link.type}
                      </span>
                      
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        link.isWorking ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {link.status}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-700 break-all mb-2">{link.url}</p>
                    <p className="text-sm text-gray-600 mb-2">
                      <strong>Domain:</strong> {link.domain}
                    </p>
                    
                    {link.loadTime && (
                      <div className="flex items-center text-sm text-gray-600 mb-2">
                        <Clock className="w-4 h-4 mr-1" />
                        Load time: {link.loadTime}ms
                      </div>
                    )}
                    
                    {link.error && (
                      <div className="bg-red-100 border border-red-200 rounded p-2 text-sm text-red-700">
                        <strong>Error:</strong> {link.error}
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