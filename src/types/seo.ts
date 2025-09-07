export interface SEOAuditResult {
  url: string;
  timestamp: string;
  seo_metrics: SEOMetrics;
  w_meta_attributes: {
    'w-page-type': string;
    'w-published-date': string;
    'w-business-unit': string;
    'w-sector': string;
    'w-discipline': string;
    'w-read-time': string;
    'w-thumbnail-image': string;
    'w-search-type': string;
    'w-language': string;
    'w-page-type-id': string;
    'w-business-unit-id': string;
    'w-sector-id': string;
  };
  misspellings: Misspelling[];
  image_analysis: ImageAnalysis[];
  responsiveness_tests: ResponsivenessTest[];
  link_results: LinkResult[];
  statistics: Statistics;
  errors_by_category: ErrorsByCategory;
  eloqua_form_fields: EloquaFormField[];
  pdf_links: PDFLink[];
}

export interface SEOMetrics {
  title: string;
  title_length: number;
  meta_description: string;
  meta_description_length: number;
  h1_tags: string[];
  h2_tags: string[];
  h3_tags: string[];
  h4_tags: string[];
  h5_tags: string[];
  h6_tags: string[];
  canonical_url: string;
  meta_robots: string;
  lang: string;
  images_count: number;
  images_without_alt: number;
  word_count: number;
  page_size: number;
  load_time: number;
  readability_score: number;
}


export interface Misspelling {
  word: string;
  context: string;
  suggestions: string[];
  position: number;
  sentence: string;
  language: string;
}

export interface MisspellingAnalysis {
  misspellings: Misspelling[];
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
}

export interface EnhancedMisspelling {
  word: string;
  context: string;
  suggestions: string[];
  position: number;
  sentence: string;
  language: string;
  confidence: number;
  type: 'spelling' | 'grammar' | 'context';
  severity: 'high' | 'medium' | 'low';
  rule?: string;
}

export interface EnhancedSpellCheckResult {
  misspellings: EnhancedMisspelling[];
  totalWords: number;
  misspelledWords: number;
  accuracyPercentage: number;
  detectedLanguage: string;
  suggestions: Record<string, {
    word: string;
    suggestions: string[];
    count: number;
    contexts: string[];
    confidence: number;
  }>;
}
export interface ImageAnalysis {
  url: string;
  alt_text: string;
  alt_text_status: string;
  size_kb: number | null;
  size_status: string;
  recommendations: string[];
  width: number | null;
  height: number | null;
  format: string;
}

export interface PDFLink {
  url: string;
  anchor: string;
  target: string;
  status: 'new window' | 'same window';
  element: string;
  fileSize?: string;
  isWorking?: boolean;
  responseTime?: number;
}

export interface ResponsivenessTest {
  device: string;
  screenshot_base64: string;
  width: number;
  height: number;
  has_horizontal_scroll: boolean;
  has_overflow: boolean;
  issues: string[];
  recommendations: string[];
}

export interface LinkResult {
  url: string;
  status_code: number | null;
  is_working: boolean;
  response_time: number;
  error_message: string;
  anchor_text: string;
  link_type: 'internal' | 'external';
  redirect_chain: string[];
  final_url: string;
  content_type: string;
  method_used: string;
  retry_count: number;
}

export interface Statistics {
  total_links: number;
  working_links: number;
  broken_links: number;
  internal_links: number;
  external_links: number;
  success_rate: number;
  avg_response_time: number;
  status_code_distribution: Record<number, number>;
  redirects: number;
  timeouts: number;
  network_errors: number;
}

export interface ErrorsByCategory {
  working_links: LinkResult[];
  broken_links: LinkResult[];
  '4xx_errors': LinkResult[];
  '5xx_errors': LinkResult[];
  network_errors: LinkResult[];
  redirects: LinkResult[];
  timeouts: LinkResult[];
}

export interface EloquaFormField {
  form_index: number;
  data_form_name: string;
  data_elq_id: string;
  data_redirect_page: string;
  data_analytics_name: string;
  data_endpoint: string;
  form_html: string;
  hidden_fields?: Array<{
    name: string;
    value: string;
    element: string;
  }>;
}

export interface PDFLink {
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
}

// Legacy interfaces for backward compatibility
export interface SEOError {
  type: 'critical' | 'warning' | 'suggestion';
  category: string;
  message: string;
  element?: string;
  recommendation: string;
  value?: string | number;
}

export interface BrokenLink {
  url: string;
  status: number;
  type: 'internal' | 'external';
  anchor: string;
  error: string;
  redirectChain?: string[];
}

export interface ImageIssue {
  url: string;
  type: 'no-alt' | 'empty-alt' | 'large' | 'over-1mb' | 'broken';
  altText?: string;
  size?: number;
  recommendation: string;
  element: string;
}

export interface SpellingIssue {
  type: 'spelling' | 'grammar';
  text: string;
  suggestion: string;
  context: string;
  element: string;
  position: number;
  severity: 'high' | 'medium' | 'low';
}

export interface TechnicalIssue {
  type: 'critical' | 'warning' | 'suggestion';
  category: string;
  message: string;
  recommendation: string;
  value?: string;
}

export interface RedirectIssue {
  type: string;
  sourceUrl: string;
  targetUrl: string;
  statusCode: number;
  redirectChain: string[];
  recommendation: string;
}

export interface ContentIssue {
  type: string;
  message: string;
  value?: number;
  url?: string;
  recommendation: string;
}

export interface WebError {
  type: string;
  url: string;
  statusCode: number;
  message: string;
  description: string;
  suggestion: string;
  anchor?: string;
  timestamp: string;
}

export interface ThirdPartyLink {
  misspelling_analysis?: MisspellingAnalysis;
  url: string;
  domain: string;
  status: number;
  isWorking: boolean;
  anchor: string;
  type: 'social' | 'cdn' | 'analytics' | 'advertising' | 'payment' | 'other';
  loadTime: number;
  error?: string;
}

export interface KeywordAnalysis {
  primaryKeywords: any[];
  secondaryKeywords: any[];
  keywordDensity: any[];
  searchEnginePositions: any[];
  onPageOptimization: {
    titleOptimization: number;
    metaDescriptionOptimization: number;
    headingOptimization: number;
    contentOptimization: number;
    suggestions: string[];
  };
}

export interface CompetitorAnalysis {
  competitors: any[];
  keywordGaps: any[];
  competitorKeywords: any[];
  recommendations: string[];
}

export interface PerformanceMetrics {
  totalLinks: number;
  totalImages: number;
  pageSize: number;
  mobileLoadTime: number;
  desktopLoadTime: number;
  detectedLanguage: string;
  readabilityScore: number;
  exactWordCount: number;
  gzipEnabled: boolean;
  textToCodeRatio: number;
  navigationDepth: number;
  httpLinks: number;
  httpsLinks: number;
  internalLinks: number;
  externalLinks: number;
  redirectCount: number;
  imagesOver1MB: number;
  totalFileSize: number;
  compressionRatio: number;
  workingLinks: number;
  thirdPartyDomains: number;
  mobileSpeed: number;
  desktopSpeed: number;
}

export interface Summary {
  overallScore: number;
  contentScore: number;
  technicalScore: number;
  mobileSpeed: number;
  desktopSpeed: number;
  criticalIssues: number;
  warnings: number;
  suggestions: number;
  spellingErrors: number;
  technicalIssues: number;
  performanceIssues: number;
  contentIssues: number;
  redirectIssues: number;
  webErrors: number;
  thirdPartyIssues: number;
  keywordOpportunities: number;
}

export interface SearchPosition {
  keyword: string;
  position: number;
  url: string;
  searchEngine: string;
  lastChecked: string;
}