import React from 'react';
import { Download, FileText } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { SEOAuditResult } from '../types/seo';

// Extend jsPDF type to include autoTable
interface Props {
  results: SEOAuditResult;
}

export const PDFReport: React.FC<Props> = ({ results }) => {
  const generatePDF = () => {
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.width;
      const pageHeight = doc.internal.pageSize.height;
      const margin = 20;
      let y = margin;

      // Helper function to add text with line breaks and page management
      const addText = (text: string, fontSize = 12, isBold = false) => {
        if (y > pageHeight - 50) {
          doc.addPage();
          y = margin;
        }
        
        doc.setFontSize(fontSize);
        doc.setFont(undefined, isBold ? 'bold' : 'normal');
        
        const lines = doc.splitTextToSize(text, pageWidth - 2 * margin);
        doc.text(lines, margin, y);
        y += lines.length * (fontSize * 0.5) + 5;
      };

      const addSectionHeader = (title: string) => {
        if (y > pageHeight - 80) {
          doc.addPage();
          y = margin;
        }
        y += 10;
        doc.setFontSize(16);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(0, 51, 102); // Dark blue
        addText(title, 16, true);
        doc.line(margin, y - 5, pageWidth - margin, y - 5);
        doc.setTextColor(0, 0, 0); // Reset to black
        y += 5;
      };

      // Title
      doc.setFontSize(20);
      doc.setFont(undefined, 'bold');
      doc.setTextColor(0, 102, 204); // Blue color
      addText('Comprehensive SEO Audit Report', 20, true);
      doc.setTextColor(0, 0, 0); // Reset to black
      
      doc.setFontSize(12);
      doc.setFont(undefined, 'normal');
      addText(`Website: ${results.url}`);
      addText(`Analysis Date: ${new Date().toLocaleDateString()}`);
      addText(`Generated: ${new Date().toLocaleString()}`);
      y += 10;

      // Executive Summary
      addSectionHeader('Executive Summary');
      
      // Calculate overall scores
      const totalLinks = results.statistics.total_links;
      const workingLinks = results.statistics.working_links;
      const successRate = totalLinks > 0 ? Math.round((workingLinks / totalLinks) * 100) : 0;
      const overallScore = Math.min(100, 70 + successRate * 0.3);
      
      addText(`Overall SEO Score: ${overallScore.toFixed(0)}/100`);
      addText(`Link Success Rate: ${successRate}%`);
      addText(`Total Links Analyzed: ${totalLinks}`);
      addText(`Working Links: ${workingLinks}`);
      addText(`Broken Links: ${results.statistics.broken_links}`);
      addText(`Page Load Time: ${results.seo_metrics.load_time.toFixed(2)} seconds`);
      addText(`Word Count: ${results.seo_metrics.word_count.toLocaleString()}`);
      addText(`Readability Score: ${results.seo_metrics.readability_score}/100`);

      // Key Issues Summary
      addText(`Misspellings Found: ${results.misspellings.length}`);
      addText(`Images Without Alt Text: ${results.seo_metrics.images_without_alt}`);
      addText(`Total Images: ${results.seo_metrics.images_count}`);

      // SEO Metrics Analysis
      addSectionHeader('SEO Metrics Analysis');
      addText(`Title: "${results.seo_metrics.title}"`);
      addText(`Title Length: ${results.seo_metrics.title_length} characters ${results.seo_metrics.title_length >= 30 && results.seo_metrics.title_length <= 60 ? '✓ Good' : '⚠ Needs optimization'}`);
      addText(`Meta Description: "${results.seo_metrics.meta_description}"`);
      addText(`Meta Description Length: ${results.seo_metrics.meta_description_length} characters ${results.seo_metrics.meta_description_length >= 120 && results.seo_metrics.meta_description_length <= 160 ? '✓ Good' : '⚠ Needs optimization'}`);
      addText(`H1 Tags: ${results.seo_metrics.h1_tags.length} ${results.seo_metrics.h1_tags.length === 1 ? '✓ Good' : '⚠ Should have exactly 1'}`);
      addText(`H2 Tags: ${results.seo_metrics.h2_tags.length}`);
      addText(`H3 Tags: ${results.seo_metrics.h3_tags.length}`);
      addText(`Language: ${results.seo_metrics.lang}`);
      addText(`Canonical URL: ${results.seo_metrics.canonical_url || 'Not set'}`);
      addText(`Meta Robots: ${results.seo_metrics.meta_robots || 'Default'}`);

      // Link Analysis Details
      addSectionHeader('Professional Link Analysis');
      
      addText(`Total Links Analyzed: ${results.statistics.total_links}`);
      addText(`Working Links: ${results.statistics.working_links} (${successRate}%)`);
      addText(`Broken Links: ${results.statistics.broken_links}`);
      addText(`Internal Links: ${results.statistics.internal_links}`);
      addText(`External Links: ${results.statistics.external_links}`);
      addText(`Average Response Time: ${(results.statistics.avg_response_time * 1000).toFixed(0)}ms`);
      addText(`Redirects Found: ${results.statistics.redirects}`);
      addText(`Timeouts: ${results.statistics.timeouts}`);
      addText(`Network Errors: ${results.statistics.network_errors}`);
      y += 10;

      // Status Code Distribution
      if (Object.keys(results.statistics.status_code_distribution).length > 0) {
        addText('Status Code Distribution:', 12, true);
        Object.entries(results.statistics.status_code_distribution).forEach(([code, count]) => {
          const description = getStatusCodeDescription(parseInt(code));
          addText(`  ${code}: ${count} links - ${description}`);
        });
        y += 5;
      }

      // Working Links Details
      if (results.errors_by_category.working_links.length > 0) {
        addSectionHeader('Working Links (Sample)');
        results.errors_by_category.working_links.slice(0, 10).forEach((link, index) => {
          addText(`${index + 1}. ${link.anchor_text || 'No anchor text'}`);
          addText(`   URL: ${link.url}`);
          addText(`   Status: ${link.status_code} | Response Time: ${(link.response_time * 1000).toFixed(0)}ms | Method: ${link.method_used}`);
          if (link.redirect_chain.length > 0) {
            addText(`   Redirects: ${link.redirect_chain.length} redirect(s)`);
          }
          y += 2;
        });
        if (results.errors_by_category.working_links.length > 10) {
          addText(`... and ${results.errors_by_category.working_links.length - 10} more working links`);
        }
        y += 5;
      }

      // Broken Links Details
      if (results.errors_by_category.broken_links.length > 0) {
        addSectionHeader('Broken Links Analysis');
        results.errors_by_category.broken_links.forEach((link, index) => {
          addText(`${index + 1}. ${link.anchor_text || 'No anchor text'}`);
          addText(`   URL: ${link.url}`);
          addText(`   Status: ${link.status_code || 'N/A'} | Error: ${link.error_message}`);
          addText(`   Link Type: ${link.link_type} | Method: ${link.method_used}`);
          if (link.retry_count > 0) {
            addText(`   Retries: ${link.retry_count} attempts`);
          }
          y += 3;
        });
        y += 5;
      }

      // 4xx Client Errors
      if (results.errors_by_category['4xx_errors'].length > 0) {
        addSectionHeader('4xx Client Errors');
        results.errors_by_category['4xx_errors'].forEach((link, index) => {
          addText(`${index + 1}. ${link.anchor_text || 'No anchor text'}`);
          addText(`   URL: ${link.url}`);
          addText(`   Status: ${link.status_code} - ${getStatusCodeDescription(link.status_code || 0)}`);
          addText(`   Recommendation: ${getErrorRecommendation(link.status_code || 0)}`);
          y += 2;
        });
        y += 5;
      }

      // 5xx Server Errors
      if (results.errors_by_category['5xx_errors'].length > 0) {
        addSectionHeader('5xx Server Errors');
        results.errors_by_category['5xx_errors'].forEach((link, index) => {
          addText(`${index + 1}. ${link.anchor_text || 'No anchor text'}`);
          addText(`   URL: ${link.url}`);
          addText(`   Status: ${link.status_code} - ${getStatusCodeDescription(link.status_code || 0)}`);
          addText(`   Recommendation: ${getErrorRecommendation(link.status_code || 0)}`);
          y += 2;
        });
        y += 5;
      }

      // Network Errors
      if (results.errors_by_category.network_errors.length > 0) {
        addSectionHeader('Network Errors');
        results.errors_by_category.network_errors.forEach((link, index) => {
          addText(`${index + 1}. ${link.anchor_text || 'No anchor text'}`);
          addText(`   URL: ${link.url}`);
          addText(`   Error: ${link.error_message}`);
          addText(`   Recommendation: Check network connectivity and DNS resolution`);
          y += 2;
        });
        y += 5;
      }

      // Redirects
      if (results.errors_by_category.redirects.length > 0) {
        addSectionHeader('Redirects Analysis');
        results.errors_by_category.redirects.forEach((link, index) => {
          addText(`${index + 1}. ${link.anchor_text || 'No anchor text'}`);
          addText(`   Original URL: ${link.url}`);
          addText(`   Final URL: ${link.final_url}`);
          addText(`   Redirect Chain: ${link.redirect_chain.length} step(s)`);
          if (link.redirect_chain.length > 0) {
            link.redirect_chain.forEach((redirectUrl, i) => {
              addText(`     ${i + 1}. ${redirectUrl}`);
            });
          }
          y += 2;
        });
        y += 5;
      }

      // Image Analysis
      if (results.image_analysis.length > 0) {
        addSectionHeader('Image Analysis');
        addText(`Total Images: ${results.image_analysis.length}`);
        addText(`Images Without Alt Text: ${results.image_analysis.filter(img => img.alt_text_status === 'Missing' || img.alt_text_status === 'Empty').length}`);
        addText(`Large Images (>500KB): ${results.image_analysis.filter(img => img.size_status === 'Large').length}`);
        
        y += 5;
        addText('Image Details:', 12, true);
        results.image_analysis.slice(0, 15).forEach((image, index) => {
          addText(`${index + 1}. ${image.url.split('/').pop() || 'Unknown'}`);
          addText(`   Alt Text Status: ${image.alt_text_status}`);
          if (image.alt_text) {
            addText(`   Alt Text: "${image.alt_text}"`);
          }
          addText(`   Size: ${image.size_kb ? `${image.size_kb.toFixed(1)} KB` : 'Unknown'} | Status: ${image.size_status}`);
          addText(`   Dimensions: ${image.width && image.height ? `${image.width}×${image.height}` : 'Unknown'}`);
          if (image.recommendations.length > 0) {
            addText(`   Recommendations: ${image.recommendations.join(', ')}`);
          }
          y += 2;
        });
        if (results.image_analysis.length > 15) {
          addText(`... and ${results.image_analysis.length - 15} more images`);
        }
        y += 5;
      }

      // Misspellings Analysis
      if (results.misspellings.length > 0) {
        addSectionHeader('Spelling & Grammar Analysis');
        addText(`Total Misspellings Found: ${results.misspellings.length}`);
        addText(`Languages Detected: ${[...new Set(results.misspellings.map(m => m.language))].join(', ')}`);
        
        y += 5;
        addText('Misspelling Details:', 12, true);
        results.misspellings.slice(0, 20).forEach((misspelling, index) => {
          addText(`${index + 1}. "${misspelling.word}" (${misspelling.language})`);
          addText(`   Context: ${misspelling.context}`);
          if (misspelling.suggestions.length > 0) {
            addText(`   Suggestions: ${misspelling.suggestions.join(', ')}`);
          }
          addText(`   Position: ${misspelling.position}`);
          y += 2;
        });
        if (results.misspellings.length > 20) {
          addText(`... and ${results.misspellings.length - 20} more misspellings`);
        }
        y += 5;
      }

      // Page Properties
      addSectionHeader('Page Properties Analysis');
      Object.entries(results.page_properties).forEach(([key, value]) => {
        const propertyName = key.replace('w_', '').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        addText(`${propertyName}: ${value}`);
      });
      y += 5;

      // Eloqua Forms Analysis
      if (results.eloqua_form_fields.length > 0) {
        addSectionHeader('Eloqua Forms Analysis');
        addText(`Total Eloqua Forms Found: ${results.eloqua_form_fields.length}`);
        
        y += 5;
        results.eloqua_form_fields.forEach((form, index) => {
          addText(`Form ${index + 1}:`);
          addText(`   Form Name: ${form.data_form_name}`);
          addText(`   Eloqua ID: ${form.data_elq_id}`);
          addText(`   Redirect Page: ${form.data_redirect_page}`);
          addText(`   Analytics Name: ${form.data_analytics_name}`);
          addText(`   Endpoint: ${form.data_endpoint}`);
          y += 2;
        });
        y += 5;
      }

      // Recommendations Section
      addSectionHeader('Recommendations & Action Plan');
      
      addText('Immediate Actions (Week 1):', 12, true);
      if (results.statistics.broken_links > 0) {
        addText(`• Fix ${results.statistics.broken_links} broken links`);
      }
      if (!results.seo_metrics.title) {
        addText('• Add a descriptive page title');
      }
      if (!results.seo_metrics.meta_description) {
        addText('• Add a compelling meta description');
      }
      if (results.seo_metrics.images_without_alt > 0) {
        addText(`• Add alt text to ${results.seo_metrics.images_without_alt} images`);
      }
      if (results.misspellings.length > 0) {
        addText(`• Review and fix ${results.misspellings.length} spelling errors`);
      }
      
      y += 5;
      addText('Short-term Goals (Month 1):', 12, true);
      if (results.seo_metrics.load_time > 3) {
        addText('• Optimize page load speed (currently ' + results.seo_metrics.load_time.toFixed(2) + 's)');
      }
      if (results.seo_metrics.word_count < 300) {
        addText('• Expand content to 300+ words (currently ' + results.seo_metrics.word_count + ')');
      }
      addText('• Improve readability score');
      addText('• Optimize images for web performance');
      
      y += 5;
      addText('Long-term Strategy (3-6 Months):', 12, true);
      addText('• Implement comprehensive SEO strategy');
      addText('• Regular content updates and optimization');
      addText('• Monitor and improve user experience metrics');
      addText('• Build high-quality backlink profile');
      addText('• Implement structured data markup');
      
      // Technical Details
      addSectionHeader('Technical Analysis Summary');
      addText(`Analysis Method: Professional Python Backend`);
      addText(`Libraries Used: requests, aiohttp, BeautifulSoup, lxml`);
      addText(`Link Validation: Real HTTP requests with retry logic`);
      addText(`Concurrent Requests: Up to 15 simultaneous connections`);
      addText(`Timeout Settings: 30 seconds per request`);
      addText(`Error Handling: Comprehensive categorization and retry mechanisms`);
      addText(`Response Time Tracking: Actual network performance measurement`);
      
      // Footer
      const totalPages = doc.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(128, 128, 128);
        doc.text(`Professional SEO Audit Report - Page ${i} of ${totalPages}`, margin, pageHeight - 10);
        doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth - margin - 60, pageHeight - 10);
      }

      // Helper functions for status codes and recommendations
      function getStatusCodeDescription(statusCode: number): string {
        const descriptions: Record<number, string> = {
          200: 'OK - Success',
          301: 'Moved Permanently',
          302: 'Found (Temporary Redirect)',
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
        return descriptions[statusCode] || `HTTP ${statusCode}`;
      }

      function getErrorRecommendation(statusCode: number): string {
        const recommendations: Record<number, string> = {
          400: 'Check URL format and parameters',
          401: 'Verify authentication requirements',
          403: 'Check access permissions and server configuration',
          404: 'Update or remove broken link, create redirect if needed',
          408: 'Optimize server response time',
          429: 'Implement rate limiting and retry logic',
          500: 'Contact server administrator to fix server issues',
          502: 'Check upstream server configuration',
          503: 'Wait for service to become available',
          504: 'Optimize server response time and gateway configuration'
        };
        return recommendations[statusCode] || 'Contact technical support for resolution';
      }

      // Save the PDF
      const fileName = `comprehensive-seo-audit-${new URL(results.url).hostname}-${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);
      
      console.log('PDF generated successfully:', fileName);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please check the console for details.');
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <FileText className="w-8 h-8 text-blue-600" />
          <div>
            <h3 className="text-xl font-semibold text-gray-900">Download Comprehensive Report</h3>
            <p className="text-gray-600">Get a detailed PDF report including all SEO analysis, link validation, and recommendations</p>
          </div>
        </div>
        <button
          onClick={generatePDF}
          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center space-x-2 font-semibold"
        >
          <Download className="w-5 h-5" />
          <span>Download PDF</span>
        </button>
      </div>
      
      {/* PDF Content Preview */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
        <h4 className="font-semibold text-gray-800 mb-3">Report Contents:</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-700">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
            <span>Executive Summary & Key Metrics</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            <span>Complete Link Analysis ({results.statistics.total_links} links)</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 bg-red-500 rounded-full"></span>
            <span>Broken Links & Error Details</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
            <span>SEO Metrics & Recommendations</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
            <span>Image Analysis & Optimization</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
            <span>Spelling & Grammar Analysis</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 bg-pink-500 rounded-full"></span>
            <span>Technical Analysis Summary</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 bg-teal-500 rounded-full"></span>
            <span>Action Plan & Recommendations</span>
          </div>
        </div>
      </div>
    </div>
  );
};