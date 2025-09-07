import React, { useState } from 'react';
import { Misspelling, MisspellingAnalysis } from '../types/seo';
import { ProfessionalSpellChecker, SpellCheckAnalysis } from '../utils/professionalSpellChecker';
import { 
  SpellCheck as Spell, 
  Globe, 
  AlertCircle, 
  CheckCircle, 
  Filter, 
  FileText, 
  Eye, 
  Target,
  TrendingUp,
  BookOpen,
  Lightbulb
} from 'lucide-react';

interface MisspellingsTabProps {
  misspellings: Misspelling[];
  misspellingAnalysis?: {
    content_sections: Array<{
      section_name: string;
      content: Array<{
        original_text: string;
        highlighted_text: string;
        tag: string;
        has_misspellings: boolean;
      }>;
    }>;
    suggestions_summary: Record<string, {
      word: string;
      suggestions: string[];
      count: number;
      contexts: string[];
    }>;
    total_words: number;
    misspelled_words: number;
    accuracy_percentage: number;
    detected_language: string;
  };
}

export const MisspellingsTab: React.FC<MisspellingsTabProps> = ({ 
  misspellings, 
  misspellingAnalysis 
}) => {
  const [activeSection, setActiveSection] = useState('overview');
  const [languageFilter, setLanguageFilter] = useState<string>('all');
  const [selectedContentSection, setSelectedContentSection] = useState<string>('all');
  const [enhancedResults, setEnhancedResults] = useState<SpellCheckAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  const spellChecker = React.useMemo(() => new ProfessionalSpellChecker(), []);

  const languages = [...new Set(misspellings.map(m => m.language))];
  const filteredMisspellings = languageFilter === 'all' 
    ? misspellings 
    : misspellings.filter(m => m.language === languageFilter);

  // Enhanced spell checking function
  const runEnhancedSpellCheck = async () => {
    setIsAnalyzing(true);
    try {
      // Get page content for analysis (this would normally come from the backend)
      const pageContent = document.body.innerText || 'Sample text for spell checking analysis with some common misspellings like recieve, seperate, and definately.';
      const results = await spellChecker.analyzeText(pageContent);
      setEnhancedResults(results);
    } catch (error) {
      console.error('Enhanced spell check failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getLanguageName = (code: string) => {
    const names: Record<string, string> = {
      'en': 'English',
      'es': 'Spanish', 
      'fr': 'French',
      'de': 'German',
      'it': 'Italian'
    };
    return names[code] || code.toUpperCase();
  };

  const sections = [
    { id: 'overview', label: 'Overview', icon: <TrendingUp className="w-4 h-4" /> },
    { id: 'content', label: 'Content Analysis', icon: <FileText className="w-4 h-4" /> },
    { id: 'suggestions', label: 'Suggestions Summary', icon: <Lightbulb className="w-4 h-4" /> },
    { id: 'details', label: 'Detailed List', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'enhanced', label: 'Enhanced Analysis', icon: <TrendingUp className="w-4 h-4" /> }
  ];

  return (
    <div className="space-y-6">
      {/* Section Navigation */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Misspelling sections">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`${
                  activeSection === section.id
                    ? 'border-red-500 text-red-600 bg-red-50'
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

      {/* Enhanced Analysis Section */}
      {activeSection === 'enhanced' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-purple-600" />
                Enhanced Spelling & Grammar Analysis
              </h3>
              <button
                onClick={runEnhancedSpellCheck}
                disabled={isAnalyzing}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:bg-gray-400 transition-colors flex items-center space-x-2"
              >
                {isAnalyzing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <Spell className="w-4 h-4" />
                    <span>Run Enhanced Analysis</span>
                  </>
                )}
              </button>
            </div>

            {enhancedResults ? (
              <div className="space-y-6">
                {/* Enhanced Summary */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600">{enhancedResults.totalWords}</div>
                    <div className="text-sm text-blue-700">Total Words</div>
                  </div>
                  <div className="bg-red-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-red-600">{enhancedResults.misspelledWords}</div>
                    <div className="text-sm text-red-700">Misspellings Found</div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-green-600">{enhancedResults.accuracyPercentage}%</div>
                    <div className="text-sm text-green-700">Accuracy</div>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-purple-600">{enhancedResults.readabilityScore}</div>
                    <div className="text-sm text-purple-700">Readability Score</div>
                  </div>
                </div>

                {/* Enhanced Misspellings */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">Professional Spell Check Results</h4>
                  <div className="space-y-4">
                    {enhancedResults.errors.map((error, index) => (
                      <div key={index} className={`border rounded-lg p-4 ${
                        error.severity === 'high' ? 'border-red-200 bg-red-50' :
                        error.severity === 'medium' ? 'border-yellow-200 bg-yellow-50' :
                        'border-blue-200 bg-blue-50'
                      }`}>
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center space-x-3">
                            <span className={`font-bold text-lg ${
                              error.severity === 'high' ? 'text-red-700' :
                              error.severity === 'medium' ? 'text-yellow-700' :
                              'text-blue-700'
                            }`}>
                              "{error.word}"
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              error.type === 'spelling' ? 'bg-red-100 text-red-800' :
                              error.type === 'grammar' ? 'bg-blue-100 text-blue-800' :
                              'bg-purple-100 text-purple-800'
                            }`}>
                              {error.type}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              error.severity === 'high' ? 'bg-red-100 text-red-800' :
                              error.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-blue-100 text-blue-800'
                            }`}>
                              {error.severity} priority
                            </span>
                            <span className="text-xs text-gray-600">
                              Confidence: {(error.confidence * 100).toFixed(0)}%
                            </span>
                          </div>
                        </div>

                        <div className="mb-3">
                          <div className="text-sm font-medium text-gray-700 mb-1">Context:</div>
                          <div className="bg-white p-3 rounded border text-sm text-gray-800">
                            {error.context.split(error.word).map((part, i, arr) => (
                              <span key={i}>
                                {part}
                                {i < arr.length - 1 && (
                                  <span className={`font-bold px-1 rounded ${
                                    error.severity === 'high' ? 'bg-red-200 text-red-800' :
                                    error.severity === 'medium' ? 'bg-yellow-200 text-yellow-800' :
                                    'bg-blue-200 text-blue-800'
                                  }`}>
                                    {error.word}
                                  </span>
                                )}
                              </span>
                            ))}
                          </div>
                        </div>

                        {error.suggestions.length > 0 && (
                          <div className="mb-3">
                            <div className="text-sm font-medium text-gray-700 mb-2">Suggestions:</div>
                            <div className="flex flex-wrap gap-2">
                              {error.suggestions.map((suggestion, suggestionIndex) => (
                                <span
                                  key={suggestionIndex}
                                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 hover:bg-green-200 cursor-pointer transition-colors"
                                >
                                  {suggestion}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {error.rule && (
                          <div className="text-sm text-gray-600 bg-white p-2 rounded border">
                            <strong>Rule:</strong> {error.rule}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Enhanced Suggestions Summary */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">Professional Suggestions Summary</h4>
                  <div className="space-y-3">
                    {Object.values(enhancedResults.suggestions).slice(0, 10).map((suggestion, index) => (
                      <div key={index} className="bg-white border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-3">
                            <span className="font-bold text-red-700 text-lg">"{suggestion.word}"</span>
                            <span className="text-gray-400">→</span>
                            <div className="flex flex-wrap gap-2">
                              {suggestion.suggestions.map((sug, sugIndex) => (
                                <span
                                  key={sugIndex}
                                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800"
                                >
                                  {sug}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-semibold">
                              {suggestion.count} occurrence{suggestion.count > 1 ? 's' : ''}
                            </span>
                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-semibold">
                              {(suggestion.confidence * 100).toFixed(0)}% confidence
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <Spell className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Enhanced Spell Check</h4>
                <p className="text-gray-600 mb-4">
                  Run our advanced spelling and grammar analysis for more accurate detection and better suggestions.
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-2">Enhanced Features:</p>
                    <ul className="text-xs space-y-1 text-left">
                      <li>• Professional dictionary with comprehensive word coverage</li>
                      <li>• Advanced edit distance algorithms</li>
                      <li>• Context-aware suggestions</li>
                      <li>• Confidence scoring</li>
                      <li>• Technical term recognition</li>
                      <li>• Common misspelling detection</li>
                      <li>• Readability score calculation</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Overview Section */}
      {activeSection === 'overview' && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Words</p>
                  <p className="text-3xl font-bold text-blue-600">
                    {misspellingAnalysis?.total_words?.toLocaleString() || 'N/A'}
                  </p>
                </div>
                <FileText className="w-8 h-8 text-blue-600" />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Misspellings Found</p>
                  <p className="text-3xl font-bold text-red-600">{filteredMisspellings.length}</p>
                </div>
                <Spell className="w-8 h-8 text-red-600" />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Accuracy Rate</p>
                  <p className="text-3xl font-bold text-green-600">
                    {misspellingAnalysis?.accuracy_percentage?.toFixed(1) || '100'}%
                  </p>
                </div>
                <Target className="w-8 h-8 text-green-600" />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Language</p>
                  <p className="text-3xl font-bold text-purple-600">
                    {getLanguageName(misspellingAnalysis?.detected_language || 'en')}
                  </p>
                </div>
                <Globe className="w-8 h-8 text-purple-600" />
              </div>
            </div>
          </div>

          {/* Quick Status */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            {filteredMisspellings.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500" />
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Excellent Spelling!</h4>
                <p className="text-gray-600">
                  No misspellings were detected on this page. Great job maintaining high content quality!
                </p>
              </div>
            ) : (
              <div className="text-center py-8">
                <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
                <h4 className="text-lg font-semibold text-gray-900 mb-2">
                  {filteredMisspellings.length} Misspelling{filteredMisspellings.length > 1 ? 's' : ''} Found
                </h4>
                <p className="text-gray-600">
                  Review the content sections below to see highlighted misspellings and suggested corrections.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Content Analysis Section */}
      {activeSection === 'content' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                <FileText className="w-5 h-5 mr-2 text-blue-600" />
                Content Analysis with Highlighted Misspellings
              </h3>
              
              {misspellingAnalysis?.content_sections && (
                <select
                  value={selectedContentSection}
                  onChange={(e) => setSelectedContentSection(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Sections</option>
                  {misspellingAnalysis.content_sections.map(section => (
                    <option key={section.section_name} value={section.section_name}>
                      {section.section_name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {misspellingAnalysis?.content_sections ? (
              <div className="space-y-6">
                {misspellingAnalysis.content_sections
                  .filter(section => selectedContentSection === 'all' || section.section_name === selectedContentSection)
                  .map((section, sectionIndex) => (
                    <div key={sectionIndex} className="border border-gray-200 rounded-lg overflow-hidden">
                      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                        <h4 className="font-semibold text-gray-800 flex items-center">
                          <Eye className="w-4 h-4 mr-2 text-blue-600" />
                          {section.section_name}
                          <span className="ml-2 text-sm text-gray-500">
                            ({section.content.length} item{section.content.length > 1 ? 's' : ''})
                          </span>
                        </h4>
                      </div>
                      
                      <div className="p-4 space-y-4">
                        {section.content.map((content, contentIndex) => (
                          <div key={contentIndex} className={`p-4 rounded-lg border ${
                            content.has_misspellings 
                              ? 'border-red-200 bg-red-50' 
                              : 'border-green-200 bg-green-50'
                          }`}>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                                {content.tag}
                              </span>
                              {content.has_misspellings ? (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                  <AlertCircle className="w-3 h-3 mr-1" />
                                  Has Misspellings
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  No Issues
                                </span>
                              )}
                            </div>
                            
                            <div className="prose prose-sm max-w-none">
                              <div 
                                className="text-gray-800 leading-relaxed"
                                dangerouslySetInnerHTML={{ 
                                  __html: content.highlighted_text.replace(
                                    /<span class="misspelling"/g, 
                                    '<span class="bg-red-200 text-red-800 px-1 rounded font-semibold cursor-help"'
                                  )
                                }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p>Content analysis not available</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Suggestions Summary Section */}
      {activeSection === 'suggestions' && (
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <Lightbulb className="w-5 h-5 mr-2 text-yellow-600" />
            Suggestions Summary
          </h3>

          {misspellingAnalysis?.suggestions_summary && Object.keys(misspellingAnalysis.suggestions_summary).length > 0 ? (
            <div className="space-y-4">
              {Object.values(misspellingAnalysis.suggestions_summary).map((suggestion, index) => (
                <div key={index} className="border border-yellow-200 rounded-lg p-4 bg-yellow-50">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <span className="font-bold text-red-700 text-lg">"{suggestion.word}"</span>
                      <span className="text-gray-400">→</span>
                      <div className="flex flex-wrap gap-2">
                        {suggestion.suggestions.map((sug, sugIndex) => (
                          <span
                            key={sugIndex}
                            className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 hover:bg-green-200 cursor-pointer transition-colors"
                          >
                            {sug}
                          </span>
                        ))}
                      </div>
                    </div>
                    <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-semibold">
                      {suggestion.count} occurrence{suggestion.count > 1 ? 's' : ''}
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-gray-700">Contexts:</div>
                    {suggestion.contexts.slice(0, 3).map((context, contextIndex) => (
                      <div key={contextIndex} className="bg-white p-2 rounded border text-sm text-gray-700">
                        "...{context}..."
                      </div>
                    ))}
                    {suggestion.contexts.length > 3 && (
                      <div className="text-xs text-gray-500">
                        +{suggestion.contexts.length - 3} more context{suggestion.contexts.length - 3 > 1 ? 's' : ''}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500" />
              <p>No spelling corrections needed!</p>
            </div>
          )}
        </div>
      )}

      {/* Detailed List Section */}
      {activeSection === 'details' && (
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900 flex items-center">
              <BookOpen className="w-5 h-5 mr-2 text-purple-600" />
              Detailed Misspellings List
            </h3>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <select
                  value={languageFilter}
                  onChange={(e) => setLanguageFilter(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Languages</option>
                  {languages.map(lang => (
                    <option key={lang} value={lang}>
                      {getLanguageName(lang)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {filteredMisspellings.length > 0 ? (
            <div className="space-y-4">
              {filteredMisspellings.map((misspelling, index) => (
                <div key={index} className="border border-red-200 rounded-lg p-4 bg-red-50">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-red-800 text-lg">
                          "{misspelling.word}"
                        </span>
                        <div className="flex items-center space-x-2 mt-1">
                          <Globe className="w-4 h-4 text-gray-500" />
                          <span className="text-sm text-gray-600">
                            {getLanguageName(misspelling.language)}
                          </span>
                          <span className="text-sm text-gray-500">
                            Position: {misspelling.position}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mb-3">
                    <div className="text-sm font-medium text-gray-700 mb-1">Context:</div>
                    <div className="bg-white p-3 rounded border text-sm text-gray-800">
                      {misspelling.context.split(misspelling.word).map((part, i, arr) => (
                        <span key={i}>
                          {part}
                          {i < arr.length - 1 && (
                            <span className="bg-red-200 text-red-800 px-1 rounded font-semibold">
                              {misspelling.word}
                            </span>
                          )}
                        </span>
                      ))}
                    </div>
                  </div>

                  {misspelling.suggestions.length > 0 && (
                    <div className="mb-3">
                      <div className="text-sm font-medium text-gray-700 mb-2">Suggestions:</div>
                      <div className="flex flex-wrap gap-2">
                        {misspelling.suggestions.map((suggestion, suggestionIndex) => (
                          <span
                            key={suggestionIndex}
                            className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 hover:bg-green-200 cursor-pointer transition-colors"
                          >
                            {suggestion}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {misspelling.sentence && (
                    <div className="pt-3 border-t border-red-200">
                      <div className="text-sm font-medium text-gray-700 mb-1">Full Sentence:</div>
                      <div className="text-sm text-gray-600 italic">
                        "{misspelling.sentence}"
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500" />
              <p>No misspellings found!</p>
            </div>
          )}
        </div>
      )}

      {/* Recommendations */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Content Quality Recommendations</h3>
        <div className="space-y-3">
          <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
            <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-800">
              <strong>Proofreading:</strong> Review all flagged words in context to ensure they are actual misspellings and not proper nouns or technical terms.
            </div>
          </div>
          <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
            <div className="text-sm text-green-800">
              <strong>Content Review:</strong> Implement a content review process with spell-checking tools before publication.
            </div>
          </div>
          <div className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg">
            <Lightbulb className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div className="text-sm text-yellow-800">
              <strong>Quality Assurance:</strong> Use browser spell check or dedicated tools like Grammarly for ongoing content quality assurance.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};