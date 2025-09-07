import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import { SEOAuditResult } from '../types/seo';

interface ChartsProps {
  results: SEOAuditResult;
}

export const Charts: React.FC<ChartsProps> = ({ results }) => {
  const issueDistribution = [
    { name: 'Critical', value: results.summary.criticalIssues, color: '#EF4444' },
    { name: 'Warnings', value: results.summary.warnings, color: '#F59E0B' },
    { name: 'Suggestions', value: results.seoErrors.filter(e => e.type === 'suggestion').length, color: '#3B82F6' },
    { name: 'Technical', value: results.summary.technicalIssues, color: '#8B5CF6' },
    { name: 'Content', value: results.summary.contentIssues, color: '#EC4899' },
    { name: 'Spelling', value: results.summary.spellingErrors, color: '#10B981' }
  ].filter(item => item.value > 0);

  const performanceScores = [
    { name: 'Overall', score: results.summary.overallScore, target: 80 },
    { name: 'Mobile', score: results.performanceMetrics.mobileSpeed, target: 70 },
    { name: 'Desktop', score: results.performanceMetrics.desktopSpeed, target: 80 },
    { name: 'Content', score: results.summary.contentScore, target: 85 },
    { name: 'Technical', score: results.summary.technicalScore, target: 90 },
    { name: 'Readability', score: results.performanceMetrics.readabilityScore, target: 70 }
  ];

  const categoryData = results.seoErrors.reduce((acc, error) => {
    const category = error.category.charAt(0).toUpperCase() + error.category.slice(1);
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const categoryChartData = Object.entries(categoryData).map(([category, count]) => ({
    category,
    count,
    critical: results.seoErrors.filter(e => e.category === category.toLowerCase() && e.type === 'critical').length,
    warning: results.seoErrors.filter(e => e.category === category.toLowerCase() && e.type === 'warning').length,
    suggestion: results.seoErrors.filter(e => e.category === category.toLowerCase() && e.type === 'suggestion').length
  }));

  const linkData = [
    { name: 'Working Links', value: results.performanceMetrics.workingLinks, color: '#10B981' },
    { name: 'Broken Links', value: results.brokenLinks.length, color: '#EF4444' }
  ];

  const imageAnalysis = [
    { name: 'Normal Images', value: results.performanceMetrics.totalImages - results.imageIssues.length, color: '#10B981' },
    { name: 'Large Images', value: results.imageIssues.filter(i => i.type === 'large').length, color: '#F59E0B' },
    { name: 'Over 1MB', value: results.imageIssues.filter(i => i.type === 'over-1mb').length, color: '#EF4444' },
    { name: 'Missing Alt', value: results.imageIssues.filter(i => i.type === 'no-alt' || i.type === 'empty-alt').length, color: '#8B5CF6' },
    { name: 'Broken Images', value: results.imageIssues.filter(i => i.type === 'broken').length, color: '#DC2626' }
  ].filter(item => item.value > 0);

  const technicalMetrics = [
    { name: 'Page Size', value: Math.round(results.performanceMetrics.pageSize / 1024), unit: 'KB', target: 500 },
    { name: 'Load Time', value: Math.round(results.performanceMetrics.desktopLoadTime / 1000), unit: 's', target: 3 },
    { name: 'Text Ratio', value: results.performanceMetrics.textToCodeRatio, unit: '%', target: 15 },
    { name: 'Word Count', value: Math.round(results.performanceMetrics.exactWordCount / 100), unit: '×100', target: 5 }
  ];

  const radarData = [
    { subject: 'SEO', A: results.summary.overallScore, fullMark: 100 },
    { subject: 'Performance', A: (results.performanceMetrics.mobileSpeed + results.performanceMetrics.desktopSpeed) / 2, fullMark: 100 },
    { subject: 'Content', A: results.summary.contentScore, fullMark: 100 },
    { subject: 'Technical', A: results.summary.technicalScore, fullMark: 100 },
    { subject: 'Accessibility', A: Math.max(0, 100 - (results.imageIssues.filter(i => i.type === 'no-alt' || i.type === 'empty-alt').length * 10)), fullMark: 100 },
    { subject: 'Security', A: results.performanceMetrics.httpsLinks > results.performanceMetrics.httpLinks ? 85 : 60, fullMark: 100 }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Issue Distribution Pie Chart */}
      <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Issue Distribution</h3>
        {issueDistribution.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={issueDistribution}
                cx="50%"
                cy="50%"
                outerRadius={100}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}`}
              >
                {issueDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-64 text-gray-500">
            <div className="text-center">
              <svg className="w-16 h-16 mx-auto mb-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <p>No issues detected!</p>
            </div>
          </div>
        )}
      </div>

      {/* Performance Radar Chart */}
      <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Performance Overview</h3>
        <ResponsiveContainer width="100%" height={300}>
          <RadarChart data={radarData}>
            <PolarGrid />
            <PolarAngleAxis dataKey="subject" />
            <PolarRadiusAxis angle={90} domain={[0, 100]} />
            <Radar name="Score" dataKey="A" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Performance Scores Comparison */}
      <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Performance Scores vs Targets</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={performanceScores}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis domain={[0, 100]} />
            <Tooltip />
            <Legend />
            <Bar dataKey="score" fill="#3B82F6" name="Current Score" />
            <Bar dataKey="target" fill="#10B981" name="Target Score" opacity={0.6} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Link Status Chart */}
      <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Professional Link Analysis</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={linkData}
              cx="50%"
              cy="50%"
              outerRadius={100}
              dataKey="value"
              label={({ name, value }) => `${name}: ${value}`}
            >
              {linkData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Image Analysis */}
      {imageAnalysis.length > 0 && (
        <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Image Analysis</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={imageAnalysis}
                cx="50%"
                cy="50%"
                outerRadius={100}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}`}
              >
                {imageAnalysis.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Technical Metrics */}
      <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Technical Metrics</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={technicalMetrics}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip formatter={(value, name, props) => [`${value}${props.payload.unit}`, name]} />
            <Legend />
            <Bar dataKey="value" fill="#8B5CF6" name="Current" />
            <Bar dataKey="target" fill="#10B981" name="Target" opacity={0.6} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Category Breakdown */}
      {categoryChartData.length > 0 && (
        <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100 lg:col-span-2">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">SEO Issues by Category</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={categoryChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="critical" stackId="a" fill="#EF4444" name="Critical" />
              <Bar dataKey="warning" stackId="a" fill="#F59E0B" name="Warning" />
              <Bar dataKey="suggestion" stackId="a" fill="#3B82F6" name="Suggestion" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};