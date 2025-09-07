import React, { useState } from 'react';
import { ImageAnalysis, ResponsivenessTest } from '../types/seo';
import { 
  Image as ImageIcon, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Monitor, 
  Smartphone, 
  Tablet,
  Filter,
  ExternalLink,
  Download,
  Copy,
  FileText
} from 'lucide-react';

interface ImageTabProps {
  imageAnalysis: ImageAnalysis[];
  responsivenessTests: ResponsivenessTest[];
  pdfLinks?: Array<{
    url: string;
    anchor_text: string;
    target_attribute: string;
    window_behavior: 'new window' | 'same window';
    element_html: string;
    file_size: string | null;
    is_working: boolean;
    response_time: number;
    status_code: number | null;
    error_message: string;
    content_type: string;
    last_modified: string;
    file_extension: string;
  }>;
  auditedUrl?: string;
}

export const ImageTab: React.FC<ImageTabProps> = ({ imageAnalysis, responsivenessTests, pdfLinks = [], auditedUrl }) => {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sizeFilter, setSizeFilter] = useState<string>('all');

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Good':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'Missing':
      case 'Empty':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Good':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'Missing':
      case 'Empty':
        return 'bg-red-50 border-red-200 text-red-800';
      default:
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
    }
  };

  const getSizeColor = (status: string) => {
    return status === 'Large' 
      ? 'bg-red-50 border-red-200 text-red-800'
      : 'bg-green-50 border-green-200 text-green-800';
  };

  const getDeviceIcon = (device: string) => {
    switch (device.toLowerCase()) {
      case 'mobile':
        return <Smartphone className="w-5 h-5" />;
      case 'tablet':
        return <Tablet className="w-5 h-5" />;
      default:
        return <Monitor className="w-5 h-5" />;
    }
  };

  const filteredImages = imageAnalysis.filter(image => {
    const statusMatch = statusFilter === 'all' || image.alt_text_status.toLowerCase() === statusFilter.toLowerCase();
    const sizeMatch = sizeFilter === 'all' || image.size_status.toLowerCase() === sizeFilter.toLowerCase();
    return statusMatch && sizeMatch;
  });

  const largeImages = imageAnalysis.filter(img => img.size_status === 'Large').length;
  const missingAltImages = imageAnalysis.filter(img => img.alt_text_status === 'Missing' || img.alt_text_status === 'Empty').length;

  return (
    <div className="space-y-6">
      {/* Image Analysis Summary */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <ImageIcon className="w-5 h-5 mr-2 text-blue-600" />
          Image Analysis Summary
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{imageAnalysis.length}</div>
            <div className="text-sm text-blue-700">Total Images</div>
          </div>
          <div className="bg-red-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-red-600">{missingAltImages}</div>
            <div className="text-sm text-red-700">Missing Alt Text</div>
          </div>
          <div className="bg-yellow-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">{largeImages}</div>
            <div className="text-sm text-yellow-700">Large Images (&gt;500KB)</div>
          </div>
          <div className="bg-green-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {imageAnalysis.length - missingAltImages - largeImages}
            </div>
            <div className="text-sm text-green-700">Optimized Images</div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4 mb-6">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Filters:</span>
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Alt Text Status</option>
            <option value="good">Good</option>
            <option value="missing">Missing</option>
            <option value="empty">Empty</option>
            <option value="too short">Too Short</option>
            <option value="too long">Too Long</option>
          </select>

          <select
            value={sizeFilter}
            onChange={(e) => setSizeFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Sizes</option>
            <option value="optimal">Optimal</option>
            <option value="large">Large (&gt;500KB)</option>
          </select>
        </div>

        {/* Images Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-700">Image</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Alt Text Status</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Size</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Dimensions</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Recommendations</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredImages.map((image, index) => (
                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                        <img 
                          src={image.url} 
                          alt={image.alt_text || 'Image'} 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                            (e.target as HTMLImageElement).nextElementSibling!.classList.remove('hidden');
                          }}
                        />
                        <ImageIcon className="w-6 h-6 text-gray-400 hidden" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 truncate">
                          {image.url.split('/').pop() || 'Unknown'}
                        </div>
                        <div className="text-xs text-gray-500 truncate">
                          {image.format}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(image.alt_text_status)}
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(image.alt_text_status)}`}>
                        {image.alt_text_status}
                      </span>
                    </div>
                    {image.alt_text && (
                      <div className="text-xs text-gray-600 mt-1 truncate max-w-xs">
                        "{image.alt_text}"
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getSizeColor(image.size_status)}`}>
                        {image.size_status}
                      </span>
                    </div>
                    {image.size_kb && (
                      <div className="text-xs text-gray-600 mt-1">
                        {image.size_kb.toFixed(1)} KB
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-sm text-gray-900">
                      {image.width && image.height 
                        ? `${image.width} × ${image.height}` 
                        : 'Unknown'
                      }
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="space-y-1">
                      {image.recommendations.slice(0, 2).map((rec, recIndex) => (
                        <div key={recIndex} className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
                          {rec}
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex space-x-2">
                      <a
                        href={image.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded transition-colors"
                        title="View image"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                      <a
                        href={image.url}
                        download
                        className="p-1 text-green-600 hover:text-green-800 hover:bg-green-100 rounded transition-colors"
                        title="Download image"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredImages.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <ImageIcon className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p>No images match the selected filters</p>
          </div>
        )}
      </div>

      {/* PDF Links Analysis */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <FileText className="w-5 h-5 mr-2 text-red-600" />
          PDF Links Analysis
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{pdfLinks.length}</div>
            <div className="text-sm text-blue-700">Total PDF Links</div>
          </div>
          <div className="bg-green-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {pdfLinks.filter(link => link.window_behavior === 'new window').length}
            </div>
            <div className="text-sm text-green-700">New Window</div>
            <div className="text-xs text-green-600">target="_blank"</div>
          </div>
          <div className="bg-yellow-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {pdfLinks.filter(link => link.window_behavior === 'same window').length}
            </div>
            <div className="text-sm text-yellow-700">Same Window</div>
            <div className="text-xs text-yellow-600">no target attribute</div>
          </div>
          {/*<div className="bg-red-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-red-600">
              {pdfLinks.filter(link => !link.is_working).length}
            </div>
            <div className="text-sm text-red-700">Broken PDFs</div>
            <div className="text-xs text-red-600">not accessible</div>
          </div>*/}
        </div>

        {pdfLinks.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-700">PDF Document</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Target Attribute</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Window Behavior</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">File Info</th>
                 {/* <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>*/}
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Recommendation</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pdfLinks.map((link, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-3">
                        <FileText className="w-5 h-5 text-red-600 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-900 truncate">
                            {link.anchor_text}
                          </div>
                          <div className="text-xs text-gray-500 truncate font-mono">
                            {link.url.split('/').pop()}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${
                        link.target_attribute === '_blank' 
                          ? 'bg-green-100 text-green-800 border-green-200' 
                          : 'bg-gray-100 text-gray-800 border-gray-200'
                      }`}>
                        {link.target_attribute || 'none'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        {link.window_behavior === 'new window' ? (
                          <ExternalLink className="w-4 h-4 text-green-600" />
                        ) : (
                          <Monitor className="w-4 h-4 text-yellow-600" />
                        )}
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${
                          link.window_behavior === 'new window'
                            ? 'bg-green-50 border-green-200 text-green-800'
                            : 'bg-yellow-50 border-yellow-200 text-yellow-800'
                        }`}>
                          {link.window_behavior}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm text-gray-900">
                        {link.file_size && (
                          <div className="text-xs text-gray-600">Size: {link.file_size}</div>
                        )}
                        {link.response_time > 0 && (
                          <div className="text-xs text-gray-500">Load: {(link.response_time * 1000).toFixed(0)}ms</div>
                        )}
                        {link.content_type && (
                          <div className="text-xs text-gray-500">Type: {link.content_type}</div>
                        )}
                      </div>
                    </td>
                   {/*} <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        {link.is_working ? (
                          <>
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            <span className="text-xs text-green-700 font-medium">Working</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-4 h-4 text-red-600" />
                            <span className="text-xs text-red-700 font-medium">Broken</span>
                          </>
                        )}
                        {link.status_code && (
                          <span className="text-xs text-gray-500">({link.status_code})</span>
                        )}
                      </div>
                      {link.error_message && (
                        <div className="text-xs text-red-600 mt-1">{link.error_message}</div>
                      )}
                    </td>*/}
                    <td className="py-3 px-4">
                      <div className="text-xs">
                        {link.window_behavior === 'new window' ? (
                          <span className="text-green-700 bg-green-100 px-2 py-1 rounded">
                            ✓ Good practice
                          </span>
                        ) : (
                          <span className="text-yellow-700 bg-yellow-100 px-2 py-1 rounded">
                            ⚠ Add target="_blank"
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex space-x-2">
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded transition-colors"
                          title="Open PDF"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                        <button
                          onClick={() => navigator.clipboard.writeText(link.url)}
                          className="p-1 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
                          title="Copy URL"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => navigator.clipboard.writeText(link.element_html)}
                          className="p-1 text-purple-600 hover:text-purple-800 hover:bg-purple-100 rounded transition-colors"
                          title="Copy HTML element"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p>No PDF links found on this page</p>
            <div className="mt-4 text-xs text-gray-400">
              Backend analysis found no PDF links on the analyzed page
            </div>
          </div>
        )}

        {/* PDF Links Best Practices */}
        {pdfLinks.length > 0 && (
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-3 flex items-center">
              <FileText className="w-4 h-4 mr-2" />
              PDF Links Best Practices & Statistics
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
              <div>
                <div className="font-medium text-green-800 mb-2 flex items-center">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  ✅ Recommended Practices:
                </div>
                <ul className="space-y-1 text-xs text-green-700">
                  <li>• Use target="_blank" to open PDFs in new window</li>
                  <li>• Include file size in link text (e.g., "Report (PDF, 2.3MB)")</li>
                  <li>• Add "PDF" indicator in anchor text</li>
                  <li>• Use descriptive, meaningful link text</li>
                  <li>• Include rel="noopener noreferrer" for security</li>
                  <li>• Provide alternative formats when possible</li>
                </ul>
              </div>
              <div>
                <div className="font-medium text-red-800 mb-2 flex items-center">
                  <XCircle className="w-4 h-4 mr-1" />
                  ⚠️ Issues to Avoid:
                </div>
                <ul className="space-y-1 text-xs text-red-700">
                  <li>• Opening large PDFs in same window</li>
                  <li>• Generic link text like "Click here" or "Download"</li>
                  <li>• Missing file size information</li>
                  <li>• No PDF format indicator</li>
                  <li>• Broken or inaccessible PDF links</li>
                  <li>• Missing accessibility considerations</li>
                </ul>
              </div>
            </div>
            
            {/* Real-time Statistics Summary */}
            <div className="mt-4 pt-4 border-t border-blue-200">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-lg font-bold text-blue-600">
                    {Math.round((pdfLinks.filter(l => l.window_behavior === 'new window').length / Math.max(pdfLinks.length, 1)) * 100)}%
                  </div>
                  <div className="text-xs text-blue-700">Use target="_blank"</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-green-600">
                    {Math.round((pdfLinks.filter(l => l.is_working).length / Math.max(pdfLinks.length, 1)) * 100)}%
                  </div>
                  <div className="text-xs text-green-700">Working PDFs</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-purple-600">
                    {Math.round((pdfLinks.filter(l => l.anchor_text.toLowerCase().includes('pdf')).length / Math.max(pdfLinks.length, 1)) * 100)}%
                  </div>
                  <div className="text-xs text-purple-700">Have PDF indicator</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-orange-600">
                    {pdfLinks.filter(l => l.file_size).length}
                  </div>
                  <div className="text-xs text-orange-700">Have size info</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Responsiveness Testing */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <Monitor className="w-5 h-5 mr-2 text-purple-600" />
          Responsiveness Testing
        </h3>

        <ResponsivenessTestingComponent auditedUrl={auditedUrl} />
      </div>
    </div>
  );
};

interface ResponsivenessTestingProps {
  auditedUrl?: string;
}

const ResponsivenessTestingComponent: React.FC<ResponsivenessTestingProps> = ({ auditedUrl }) => {
  const [selectedDevice, setSelectedDevice] = useState('desktop');
  const [customWidth, setCustomWidth] = useState(1200);
  const [customHeight, setCustomHeight] = useState(800);
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [testingMethod, setTestingMethod] = useState<'popup' | 'newTab' | 'screenshot' | 'simulator'>('popup');
  const [isTestingActive, setIsTestingActive] = useState(false);
  const [popupWindow, setPopupWindow] = useState<Window | null>(null);
  const [currentUrl, setCurrentUrl] = useState('');

  // Get the actual audited URL
  React.useEffect(() => {
    const getAuditedUrl = () => {
      // Priority order for getting the URL
      if (auditedUrl) {
        return auditedUrl;
      }
      
      // Try to get from session storage
      const sessionUrl = sessionStorage.getItem('auditedUrl');
      if (sessionUrl) {
        return sessionUrl;
      }
      
      // Try to get from local storage
      const localUrl = localStorage.getItem('lastAuditedUrl');
      if (localUrl) {
        return localUrl;
      }
      
      // Try to get from global window object
      if ((window as any).currentAuditUrl) {
        return (window as any).currentAuditUrl;
      }
      
      // Try to get from URL parameters
      const urlParams = new URLSearchParams(window.location.search);
      const paramUrl = urlParams.get('url');
      if (paramUrl) {
        return decodeURIComponent(paramUrl);
      }
      
      // Default fallback
      return 'https://example.com';
    };
    
    const url = getAuditedUrl();
    setCurrentUrl(url);
    console.log('Responsiveness Testing - Using URL:', url);
  }, [auditedUrl]);

  const devices = {
    mobile: { name: 'Mobile', width: 375, height: 667, icon: <Smartphone className="w-4 h-4" /> },
    tablet: { name: 'Tablet', width: 768, height: 1024, icon: <Tablet className="w-4 h-4" /> },
    desktop: { name: 'Desktop', width: 1200, height: 800, icon: <Monitor className="w-4 h-4" /> },
    custom: { name: 'Custom', width: customWidth, height: customHeight, icon: <Monitor className="w-4 h-4" /> }
  };

  const currentDevice = devices[selectedDevice as keyof typeof devices];
  const iframeWidth = isCustomMode ? customWidth : currentDevice.width;
  const iframeHeight = isCustomMode ? customHeight : currentDevice.height;

  const openResponsivenessTest = () => {
    if (!currentUrl) return;
    
    setIsTestingActive(true);
    
    switch (testingMethod) {
      case 'popup':
        openPopupWindow();
        break;
      case 'newTab':
        openNewTab();
        break;
      case 'screenshot':
        openScreenshotService();
        break;
      case 'simulator':
        openDeviceSimulator();
        break;
    }
  };

  const openPopupWindow = () => {
    if (popupWindow && !popupWindow.closed) {
      popupWindow.close();
    }
    
    const popup = window.open(
      currentUrl,
      'responsiveness-test',
      `width=${iframeWidth},height=${iframeHeight},scrollbars=yes,resizable=yes,toolbar=no,menubar=no,location=yes`
    );
    
    setPopupWindow(popup);
    
    if (popup) {
      popup.focus();
      // Try to resize after load
      popup.addEventListener('load', () => {
        popup.resizeTo(iframeWidth, iframeHeight);
      });
    }
  };

  const openNewTab = () => {
    const newTab = window.open(currentUrl, '_blank');
    if (newTab) {
      newTab.focus();
      // Add instructions for manual testing
      setTimeout(() => {
        if (newTab && !newTab.closed) {
          newTab.postMessage({
            type: 'responsiveness-test',
            dimensions: { width: iframeWidth, height: iframeHeight },
            instructions: `Resize your browser window to ${iframeWidth}x${iframeHeight} pixels to test ${currentDevice.name} view`
          }, '*');
        }
      }, 1000);
    }
  };

  const openScreenshotService = () => {
    // Use a screenshot service API
    const screenshotUrl = `https://api.screenshotmachine.com/?key=demo&url=${encodeURIComponent(currentUrl)}&dimension=${iframeWidth}x${iframeHeight}`;
    window.open(screenshotUrl, '_blank');
  };

  const openDeviceSimulator = () => {
    // Open browser dev tools simulator
    const simulatorUrl = `https://www.responsinator.com/?url=${encodeURIComponent(currentUrl)}`;
    window.open(simulatorUrl, '_blank');
  };

  const closePopup = () => {
    if (popupWindow && !popupWindow.closed) {
      popupWindow.close();
    }
    setPopupWindow(null);
    setIsTestingActive(false);
  };

  const handleCustomSizeChange = () => {
    setIsCustomMode(true);
    setSelectedDevice('custom');
  };

  return (
    <div className="space-y-6">
      {/* Device Controls */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <h4 className="font-semibold text-gray-800">Device Simulation</h4>
          <div className="flex items-center space-x-2">
            <select
              value={testingMethod}
              onChange={(e) => setTestingMethod(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="popup">Popup Window</option>
              <option value="newTab">New Tab</option>
              {/*<option value="screenshot">Screenshot Service</option>
              <option value="simulator">Device Simulator</option>*/}
            </select>
            <button
              onClick={openResponsivenessTest}
              disabled={!currentUrl}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors text-sm"
            >
              <Monitor className="w-4 h-4" />
              <span>Test Responsiveness</span>
            </button>
            {popupWindow && !popupWindow.closed && (
              <button
                onClick={closePopup}
                className="flex items-center space-x-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span>Close</span>
              </button>
            )}
          </div>
        </div>

        {/* Device Buttons */}
        <div className="flex flex-wrap gap-2 mb-4">
          {Object.entries(devices).filter(([key]) => key !== 'custom').map(([key, device]) => (
            <button
              key={key}
              onClick={() => {
                setSelectedDevice(key);
                setIsCustomMode(false);
              }}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-all duration-200 ${
                selectedDevice === key && !isCustomMode
                  ? 'bg-blue-100 border-blue-300 text-blue-700'
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              {device.icon}
              <span className="font-medium">{device.name}</span>
              <span className="text-sm text-gray-500">({device.width}×{device.height})</span>
            </button>
          ))}
        </div>

        {/* Custom Size Controls */}
        <div className="border-t border-gray-200 pt-4">
          <div className="flex flex-wrap items-center gap-4">
            <span className="text-sm font-medium text-gray-700">Custom Size:</span>
            <div className="flex items-center space-x-2">
              <label className="text-sm text-gray-600">Width:</label>
              <input
                type="number"
                value={customWidth}
                onChange={(e) => {
                  setCustomWidth(parseInt(e.target.value) || 1200);
                  handleCustomSizeChange();
                }}
                className="w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="200"
                max="2000"
              />
              <span className="text-sm text-gray-500">px</span>
            </div>
            <div className="flex items-center space-x-2">
              <label className="text-sm text-gray-600">Height:</label>
              <input
                type="number"
                value={customHeight}
                onChange={(e) => {
                  setCustomHeight(parseInt(e.target.value) || 800);
                  handleCustomSizeChange();
                }}
                className="w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="200"
                max="1500"
              />
              <span className="text-sm text-gray-500">px</span>
            </div>
          </div>
        </div>

        {/* Current Dimensions Display */}
        <div className="mt-4 p-3 bg-white rounded border">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {currentDevice.icon}
              <span className="font-medium text-gray-900">
                {isCustomMode ? 'Custom' : currentDevice.name} View
              </span>
            </div>
            <span className="text-sm text-gray-600">
              {iframeWidth} × {iframeHeight} pixels
            </span>
          </div>
        </div>
      </div>

      {/* Testing Methods Information */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h4 className="font-semibold text-gray-800 mb-4">Responsiveness Testing Methods</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className={`p-4 rounded-lg border-2 transition-all ${
            testingMethod === 'popup' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-gray-50'
          }`}>
            <div className="flex items-center space-x-2 mb-2">
              <Monitor className="w-5 h-5 text-blue-600" />
              <span className="font-medium text-gray-900">Popup Window</span>
              {testingMethod === 'popup' && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">Selected</span>}
            </div>
            <p className="text-sm text-gray-600">Opens website in a resizable popup window with exact device dimensions</p>
          </div>

          <div className={`p-4 rounded-lg border-2 transition-all ${
            testingMethod === 'newTab' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-gray-50'
          }`}>
            <div className="flex items-center space-x-2 mb-2">
              <ExternalLink className="w-5 h-5 text-green-600" />
              <span className="font-medium text-gray-900">New Tab</span>
              {testingMethod === 'newTab' && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">Selected</span>}
            </div>
            <p className="text-sm text-gray-600">Opens website in new tab with instructions for manual browser resizing</p>
          </div>

          {/*<div className={`p-4 rounded-lg border-2 transition-all ${
            testingMethod === 'screenshot' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-gray-50'
          }`}>
            <div className="flex items-center space-x-2 mb-2">
              <ImageIcon className="w-5 h-5 text-purple-600" />
              <span className="font-medium text-gray-900">Screenshot Service</span>
              {testingMethod === 'screenshot' && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">Selected</span>}
            </div>
            <p className="text-sm text-gray-600">Uses external service to capture website screenshots at specific dimensions</p>
          </div>*/}

          {/*<div className={`p-4 rounded-lg border-2 transition-all ${
            testingMethod === 'simulator' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-gray-50'
          }`}>
            <div className="flex items-center space-x-2 mb-2">
              <Smartphone className="w-5 h-5 text-orange-600" />
              <span className="font-medium text-gray-900">Device Simulator</span>
              {testingMethod === 'simulator' && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">Selected</span>}
            </div>
            <p className="text-sm text-gray-600">Opens external device simulator showing multiple device views simultaneously</p>
          </div>*/}
        </div>

        {/* Current Testing Status */}
        {isTestingActive && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="font-medium text-green-800">
                Responsiveness test active for {currentDevice.name} ({iframeWidth}×{iframeHeight})
              </span>
            </div>
            <p className="text-sm text-green-700 mt-1">
              {testingMethod === 'popup' && 'Popup window opened with exact device dimensions'}
              {testingMethod === 'newTab' && 'New tab opened - resize your browser window to test responsiveness'}
              {testingMethod === 'screenshot' && 'Screenshot service opened in new tab'}
              {testingMethod === 'simulator' && 'Device simulator opened showing multiple device views'}
            </p>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h5 className="font-medium text-blue-900 mb-2">How to Test:</h5>
          <ol className="text-sm text-blue-800 space-y-1">
            <li>1. Select a device type (Mobile, Tablet, Desktop) or enter custom dimensions</li>
            <li>2. Choose your preferred testing method from the dropdown</li>
            <li>3. Click "Test Responsiveness" to open the website</li>
            <li>4. Observe how the website adapts to the selected screen size</li>
            <li>5. Test different devices to ensure responsive design works properly</li>
          </ol>
        </div>
      </div>

      {/* Alternative Testing Tools */}
      {/*<div className="bg-white rounded-lg border border-gray-200 p-6">
        <h4 className="font-semibold text-gray-800 mb-4">Alternative Testing Tools</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a
            href={`https://www.responsinator.com/?url=${encodeURIComponent(currentUrl)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Smartphone className="w-6 h-6 text-blue-600" />
            <div>
              <div className="font-medium text-gray-900">Responsinator</div>
              <div className="text-sm text-gray-600">Multi-device preview</div>
            </div>
            <ExternalLink className="w-4 h-4 text-gray-400" />
          </a>

          <a
            href={`https://search.google.com/test/mobile-friendly?url=${encodeURIComponent(currentUrl)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Monitor className="w-6 h-6 text-green-600" />
            <div>
              <div className="font-medium text-gray-900">Google Mobile Test</div>
              <div className="text-sm text-gray-600">Official mobile-friendly test</div>
            </div>
            <ExternalLink className="w-4 h-4 text-gray-400" />
          </a>

          <button
            onClick={() => {
              navigator.clipboard.writeText(currentUrl);
              alert('URL copied! Open browser dev tools (F12) and use device simulation mode.');
            }}
            className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
          >
            <Copy className="w-6 h-6 text-purple-600" />
            <div>
              <div className="font-medium text-gray-900">Browser Dev Tools</div>
              <div className="text-sm text-gray-600">Copy URL for manual testing</div>
            </div>
          </button>
        </div>
      </div>*/}

      {/* URL Information */}
      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
        <div className="flex items-start space-x-3">
          <div className="text-blue-600">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Testing Website:</p>
            <p className="font-mono text-xs bg-white px-2 py-1 rounded border break-all">{currentUrl}</p>
            <p className="text-xs mt-2 opacity-75">
              This is the website you submitted for SEO audit. Use the device controls above to see how it appears on different screen sizes.
            </p>
          </div>
        </div>
      </div>

      {/* Responsiveness Analysis */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-3">Responsiveness Analysis</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(devices).filter(([key]) => key !== 'custom').map(([key, device]) => {
            const isCurrentDevice = selectedDevice === key && !isCustomMode;
            return (
              <div key={key} className={`p-3 rounded-lg border ${
                isCurrentDevice 
                  ? 'bg-blue-50 border-blue-200' 
                  : 'bg-white border-gray-200'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    {device.icon}
                    <span className="font-medium text-gray-900">{device.name}</span>
                  </div>
                  {isCurrentDevice && (
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">Current</span>
                  )}
                </div>
                <div className="text-sm text-gray-600">
                  {device.width} × {device.height} pixels
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {key === 'mobile' && 'Typical smartphone size'}
                  {key === 'tablet' && 'Standard tablet dimensions'}
                  {key === 'desktop' && 'Common desktop resolution'}
                </div>
              </div>
            );
          })}
        </div>

        {/* Tips */}
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
          <div className="flex items-start space-x-2">
            <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Responsiveness Testing Tips:</p>
              <ul className="text-xs space-y-1">
                <li>• Check if content adapts properly to different screen sizes</li>
                <li>• Ensure text remains readable on smaller screens</li>
                <li>• Verify navigation menus work on mobile devices</li>
                <li>• Test form inputs and buttons for touch accessibility</li>
                <li>• Look for horizontal scrolling issues on mobile</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};