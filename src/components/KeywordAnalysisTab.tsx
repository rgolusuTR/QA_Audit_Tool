import React, { useState } from 'react';
import { KeywordAnalysis, SearchPosition, CompetitorAnalysis } from '../types/seo';
import { Search, TrendingUp, Target, Users, BarChart3, ExternalLink } from 'lucide-react';

interface KeywordAnalysisTabProps {
  keywordAnalysis: KeywordAnalysis;
  competitorAnalysis: CompetitorAnalysis;
}

export const KeywordAnalysisTab: React.FC<KeywordAnalysisTabProps> = ({ 
  keywordAnalysis, 
  competitorAnalysis 
}) => {
  const [activeSection, setActiveSection] = useState('keywords');

  const sections = [
    { id: 'keywords', label: 'Keyword Analysis', icon: <Search className="w-4 h-4" /> },
    { id: 'positions', label: 'Search Positions', icon: <TrendingUp className="w-4 h-4" /> },
    { id: 'competitors', label: 'Competitor Analysis', icon: <Users className="w-4 h-4" /> },
    { id: 'opportunities', label: 'Opportunities', icon: <Target className="w-4 h-4" /> }
  ];

  const getDensityColor = (density: number) => {
    if (density > 3) return 'text-red-600 bg-red-50';
    if (density > 2) return 'text-yellow-600 bg-yellow-50';
    return 'text-green-600 bg-green-50';
  };

  const getPositionColor = (position: number) => {
    if (position <= 3) return 'text-green-600 bg-green-50';
    if (position <= 10) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getOpportunityColor = (opportunity: string) => {
    switch (opportunity) {
      case 'high': return 'text-green-600 bg-green-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="space-y-6">
      {/* Section Navigation */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Keyword sections">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`${
                  activeSection === section.id
                    ? 'border-blue-500 text-blue-600 bg-blue-50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-4 border-b-2 font-medium text-sm flex items-center space-x-2 transition-all duration-200 rounded-t-lg`}
              >
                {section.icon}
                <span>{section.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Keyword Analysis Section */}
      {activeSection === 'keywords' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Primary Keywords */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Target className="w-5 h-5 mr-2 text-blue-600" />
              Primary Keywords ({keywordAnalysis.primaryKeywords.length})
            </h3>
            <div className="space-y-3">
              {keywordAnalysis.primaryKeywords.map((keyword, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900">{keyword.keyword}</span>
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${getDensityColor(keyword.density)}`}>
                      {keyword.density}%
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                    <div>Frequency: {keyword.frequency}</div>
                    <div>Prominence: {keyword.prominence}%</div>
                  </div>
                  <div className="mt-2 text-xs text-gray-500">
                    Found in: {keyword.locations.join(', ')}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Secondary Keywords */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Search className="w-5 h-5 mr-2 text-green-600" />
              Secondary Keywords ({keywordAnalysis.secondaryKeywords.length})
            </h3>
            <div className="space-y-3">
              {keywordAnalysis.secondaryKeywords.map((keyword, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900">{keyword.keyword}</span>
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${getDensityColor(keyword.density)}`}>
                      {keyword.density}%
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                    <div>Frequency: {keyword.frequency}</div>
                    <div>Prominence: {keyword.prominence}%</div>
                  </div>
                  <div className="mt-2 text-xs text-gray-500">
                    Found in: {keyword.locations.join(', ')}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Keyword Density Analysis */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 lg:col-span-2">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <BarChart3 className="w-5 h-5 mr-2 text-purple-600" />
              Keyword Density Analysis
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {keywordAnalysis.keywordDensity.map((item, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900">{item.keyword}</span>
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${getDensityColor(item.density)}`}>
                      {item.density}%
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 mb-2">
                    Count: {item.count}
                  </div>
                  <div className="text-xs text-gray-500">
                    {item.recommendation}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Search Positions Section */}
      {activeSection === 'positions' && (
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
            Search Engine Positions
          </h3>
          <div className="space-y-4">
            {keywordAnalysis.searchEnginePositions.map((position, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <span className="font-medium text-gray-900">{position.keyword}</span>
                    <span className="text-sm text-gray-600">{position.searchEngine}</span>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getPositionColor(position.position)}`}>
                    #{position.position}
                  </span>
                </div>
                <div className="text-sm text-gray-600 break-all mb-2">
                  URL: {position.url}
                </div>
                <div className="text-xs text-gray-500">
                  Last checked: {new Date(position.lastChecked).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Competitor Analysis Section */}
      {activeSection === 'competitors' && (
        <div className="space-y-6">
          {/* Competitors Overview */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Users className="w-5 h-5 mr-2 text-purple-600" />
              Top Competitors
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {competitorAnalysis.competitors.map((competitor, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900">{competitor.domain}</span>
                    <ExternalLink className="w-4 h-4 text-gray-400" />
                  </div>
                  <div className="text-sm text-gray-600 mb-2">{competitor.title}</div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
                    <div>DA: {competitor.domainAuthority}</div>
                    <div>Traffic: {competitor.estimatedTraffic.toLocaleString()}</div>
                    <div>Backlinks: {competitor.backlinks.toLocaleString()}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Competitor Keywords */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Competitor Keywords
            </h3>
            <div className="space-y-3">
              {competitorAnalysis.competitorKeywords.map((keyword, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900">{keyword.keyword}</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">{keyword.competitor}</span>
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${getPositionColor(keyword.position)}`}>
                        #{keyword.position}
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                    <div>Search Volume: {keyword.searchVolume.toLocaleString()}</div>
                    <div>Difficulty: {keyword.difficulty}/100</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Opportunities Section */}
      {activeSection === 'opportunities' && (
        <div className="space-y-6">
          {/* Keyword Gaps */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Target className="w-5 h-5 mr-2 text-green-600" />
              Keyword Opportunities
            </h3>
            <div className="space-y-4">
              {competitorAnalysis.keywordGaps.map((gap, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900">{gap.keyword}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getOpportunityColor(gap.opportunity)}`}>
                      {gap.opportunity} opportunity
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm text-gray-600">
                    <div>Competitor: #{gap.competitorRanking}</div>
                    <div>Your rank: {gap.yourRanking ? `#${gap.yourRanking}` : 'Not ranking'}</div>
                    <div>Volume: {gap.searchVolume.toLocaleString()}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recommendations */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Recommendations
            </h3>
            <div className="space-y-3">
              {competitorAnalysis.recommendations.map((recommendation, index) => (
                <div key={index} className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <Target className="w-5 h-5 text-blue-600 mt-0.5" />
                    <p className="text-sm text-blue-800">{recommendation}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};