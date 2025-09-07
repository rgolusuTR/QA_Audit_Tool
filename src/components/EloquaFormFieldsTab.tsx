import React, { useState } from 'react';
import { EloquaFormField } from '../types/seo';
import { FormInput, Code, CheckCircle, XCircle, Copy, Eye } from 'lucide-react';

interface EloquaFormFieldsTabProps {
  eloquaFormFields: EloquaFormField[];
}

export const EloquaFormFieldsTab: React.FC<EloquaFormFieldsTabProps> = ({ eloquaFormFields }) => {
  const [expandedForm, setExpandedForm] = useState<number | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = async (text: string, fieldName: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const getFieldStatus = (value: string) => {
    return value !== "Not Available";
  };

  const getStatusIcon = (hasValue: boolean) => {
    return hasValue ? (
      <CheckCircle className="w-4 h-4 text-green-600" />
    ) : (
      <XCircle className="w-4 h-4 text-red-600" />
    );
  };

  const getStatusColor = (hasValue: boolean) => {
    return hasValue 
      ? 'bg-green-50 border-green-200 text-green-800'
      : 'bg-red-50 border-red-200 text-red-800';
  };

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <FormInput className="w-5 h-5 mr-2 text-blue-600" />
          Eloqua Form Fields Analysis
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{eloquaFormFields.length}</div>
            <div className="text-sm text-blue-700">Total Forms Found</div>
          </div>
          <div className="bg-green-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {eloquaFormFields.filter(form => 
                (form.data_elq_id && form.data_elq_id !== 'Not Available') || 
                (form.data_form_name && form.data_form_name !== 'Not Available')
              ).length}
            </div>
            <div className="text-sm text-green-700">Forms with Eloqua Data</div>
          </div>
          <div className="bg-purple-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {eloquaFormFields.reduce((count, form) => {
                const validFields = [
                  form.data_form_name,
                  form.data_elq_id,
                  form.data_redirect_page,
                  form.data_analytics_name,
                  form.data_endpoint
                ].filter(field => field && field !== "Not Available").length;
                return count + validFields;
              }, 0)}
            </div>
            <div className="text-sm text-purple-700">Total Attributes Found</div>
          </div>
        </div>

        {eloquaFormFields.length === 0 ? (
          <div className="text-center py-8">
            <div className="bg-gray-100 rounded-full p-6 w-24 h-24 mx-auto mb-6 flex items-center justify-center">
              <FormInput className="w-12 h-12 text-gray-400" />
            </div>
            <h4 className="text-xl font-semibold text-gray-900 mb-3">No Eloqua Forms Available</h4>
            <p className="text-gray-600">
              The backend analysis did not detect any Eloqua forms or tracking elements on this page.
            </p>
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
              <div className="flex items-start space-x-3">
                <div className="text-blue-600">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">What we searched for:</p>
                  <ul className="text-xs space-y-1">
                    <li>• Form elements with Eloqua attributes</li>
                    <li>• JavaScript Eloqua configurations</li>
                    <li>• Eloqua tracking pixels and iframes</li>
                    <li>• Input fields with Eloqua naming patterns</li>
                    <li>• data-elq-id, elq-form-id, eloqua-id attributes</li>
                    <li>• Script tags containing Eloqua configurations</li>
                  </ul>
                  <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded">
                    <p className="text-xs text-yellow-800">
                      <strong>Debug Info:</strong> Backend extraction using BeautifulSoup4 + lxml libraries
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <h4 className="text-lg font-semibold text-gray-800">
              Form Details ({eloquaFormFields.length} forms)
            </h4>

            {/* Forms Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Form #</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Form Name</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Eloqua ID</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Redirect Page</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Analytics Name</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Endpoint</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Hidden Fields</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {eloquaFormFields.map((form, index) => (
                    <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <span className="font-medium text-gray-900">
                          Form {form.form_index}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(getFieldStatus(form.data_form_name))}
                          <span className={`px-2 py-1 rounded text-xs font-medium border max-w-xs truncate ${
                            getStatusColor(getFieldStatus(form.data_form_name))
                          }`} title={form.data_form_name}>
                            {form.data_form_name.length > 20 ? `${form.data_form_name.substring(0, 20)}...` : form.data_form_name}
                          </span>
                          {getFieldStatus(form.data_form_name) && (
                            <button
                              onClick={() => copyToClipboard(form.data_form_name, `form-name-${index}`)}
                              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                              title="Copy value"
                            >
                              {copiedField === `form-name-${index}` ? (
                                <CheckCircle className="w-3 h-3 text-green-600" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(getFieldStatus(form.data_elq_id))}
                          <span className={`px-2 py-1 rounded text-xs font-medium border max-w-xs truncate ${
                            getStatusColor(getFieldStatus(form.data_elq_id))
                          }`} title={form.data_elq_id}>
                            {form.data_elq_id.length > 15 ? `${form.data_elq_id.substring(0, 15)}...` : form.data_elq_id}
                          </span>
                          {getFieldStatus(form.data_elq_id) && (
                            <button
                              onClick={() => copyToClipboard(form.data_elq_id, `elq-id-${index}`)}
                              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                              title="Copy value"
                            >
                              {copiedField === `elq-id-${index}` ? (
                                <CheckCircle className="w-3 h-3 text-green-600" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(getFieldStatus(form.data_redirect_page))}
                          <span className={`px-2 py-1 rounded text-xs font-medium border ${
                            getStatusColor(getFieldStatus(form.data_redirect_page))
                          }`}>
                            {form.data_redirect_page.length > 20 
                              ? `${form.data_redirect_page.substring(0, 20)}...`
                              : form.data_redirect_page
                            }
                          </span>
                          {getFieldStatus(form.data_redirect_page) && (
                            <button
                              onClick={() => copyToClipboard(form.data_redirect_page, `redirect-${index}`)}
                              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                              title="Copy value"
                            >
                              {copiedField === `redirect-${index}` ? (
                                <CheckCircle className="w-3 h-3 text-green-600" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(getFieldStatus(form.data_analytics_name))}
                          <span className={`px-2 py-1 rounded text-xs font-medium border ${
                            getStatusColor(getFieldStatus(form.data_analytics_name))
                          }`}>
                            {form.data_analytics_name}
                          </span>
                          {getFieldStatus(form.data_analytics_name) && (
                            <button
                              onClick={() => copyToClipboard(form.data_analytics_name, `analytics-${index}`)}
                              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                              title="Copy value"
                            >
                              {copiedField === `analytics-${index}` ? (
                                <CheckCircle className="w-3 h-3 text-green-600" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(getFieldStatus(form.data_endpoint))}
                          <span className={`px-2 py-1 rounded text-xs font-medium border ${
                            getStatusColor(getFieldStatus(form.data_endpoint))
                          }`}>
                            {form.data_endpoint.length > 20 
                              ? `${form.data_endpoint.substring(0, 20)}...`
                              : form.data_endpoint
                            }
                          </span>
                          {getFieldStatus(form.data_endpoint) && (
                            <button
                              onClick={() => copyToClipboard(form.data_endpoint, `endpoint-${index}`)}
                              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                              title="Copy value"
                            >
                              {copiedField === `endpoint-${index}` ? (
                                <CheckCircle className="w-3 h-3 text-green-600" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-gray-600">
                          {form.hidden_fields ? form.hidden_fields.length : 0} fields
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => setExpandedForm(expandedForm === index ? null : index)}
                          className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded transition-colors"
                          title="View form HTML"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Expanded Form HTML */}
            {expandedForm !== null && (
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <h5 className="font-medium text-gray-900 flex items-center">
                    <Code className="w-4 h-4 mr-2" />
                    Form {eloquaFormFields[expandedForm].form_index} HTML
                  </h5>
                  <button
                    onClick={() => setExpandedForm(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ×
                  </button>
                </div>
                <pre className="bg-white p-4 rounded border text-sm text-gray-800 overflow-x-auto">
                  <code>{eloquaFormFields[expandedForm].form_html}</code>
                </pre>
                
                {/* Hidden Fields Section */}
                {eloquaFormFields[expandedForm].hidden_fields && eloquaFormFields[expandedForm].hidden_fields.length > 0 && (
                  <div className="mt-4">
                    <h6 className="font-medium text-gray-900 mb-3 flex items-center">
                      <FormInput className="w-4 h-4 mr-2" />
                      Hidden Fields ({eloquaFormFields[expandedForm].hidden_fields.length})
                    </h6>
                    <div className="space-y-2">
                      {eloquaFormFields[expandedForm].hidden_fields.map((field, fieldIndex) => (
                        <div key={fieldIndex} className="bg-white border rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-gray-800">{field.name}</span>
                            <button
                              onClick={() => copyToClipboard(field.value, `hidden-${expandedForm}-${fieldIndex}`)}
                              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                              title="Copy value"
                            >
                              {copiedField === `hidden-${expandedForm}-${fieldIndex}` ? (
                                <CheckCircle className="w-3 h-3 text-green-600" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                          <div className="text-sm text-gray-600 font-mono bg-gray-50 p-2 rounded break-all">
                            {field.value || '(empty)'}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Recommendations */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Eloqua Integration Recommendations</h3>
        <div className="space-y-3">
          <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
            <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-800">
              <strong>Comprehensive Detection:</strong> Our system searches for Eloqua attributes in forms, JavaScript configurations, input fields, and tracking elements using multiple naming patterns.
            </div>
          </div>
          <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
            <div className="text-sm text-green-800">
              <strong>Multiple Patterns:</strong> We detect various attribute formats including data-elq-id, elq-form-id, eloqua-id, and JavaScript configurations.
            </div>
          </div>
          <div className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg">
            <FormInput className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div className="text-sm text-yellow-800">
              <strong>Form Integration:</strong> Ensure proper Eloqua integration with correct form names, IDs, and endpoint configurations for optimal tracking.
            </div>
          </div>
          <div className="flex items-start space-x-3 p-3 bg-purple-50 rounded-lg">
            <Code className="w-5 h-5 text-purple-600 mt-0.5" />
            <div className="text-sm text-purple-800">
              <strong>Tracking Elements:</strong> We also detect Eloqua tracking pixels, iframes, and JavaScript-based implementations for comprehensive analysis.
            </div>
          </div>
          
          {/* Debug Information */}
          <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
            <div className="text-gray-600">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="text-sm text-gray-700">
              <strong>Backend Analysis:</strong> Using Python with BeautifulSoup4 + lxml for accurate HTML parsing and comprehensive Eloqua form detection.
              {eloquaFormFields.length > 0 && (
                <div className="mt-1 text-xs text-green-700">
                  ✅ Successfully extracted {eloquaFormFields.length} Eloqua form{eloquaFormFields.length !== 1 ? 's' : ''} with detailed attributes.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};