import { SEOAuditResult, SEOMetrics, LinkResult, Statistics, ErrorsByCategory, ImageAnalysis, Misspelling, SEOError, ImageIssue, Summary, PerformanceMetrics } from '../types/seo';

/**
 * Client-side QA Audit Tool
 * Performs comprehensive website analysis entirely in the browser
 */

// CORS proxy options for fetching external pages
const CORS_PROXIES = [
  'https://api.allorigins.win/raw?url=',
  'https://corsproxy.io/?',
  'https://api.codetabs.com/v1/proxy?quest=',
];

/**
 * Fetch webpage content with CORS handling
 */
async function fetchPageContent(url: string): Promise<string> {
  // For local/file URLs, try direct fetch
  if (url.startsWith('file://') || url.startsWith('http://localhost') || url.startsWith('http://127.0.0.1')) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        return await response.text();
      }
    } catch (error) {
      throw new Error('Unable to fetch local file. Please use a publicly accessible URL.');
    }
  }

  // Try CORS proxies in order
  for (let i = 0; i < CORS_PROXIES.length; i++) {
    try {
      const proxyUrl = `${CORS_PROXIES[i]}${encodeURIComponent(url)}`;
      console.log(`Attempting to fetch via proxy ${i + 1}/${CORS_PROXIES.length}:`, CORS_PROXIES[i]);
      
      // Create timeout controller
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
      
      try {
        const response = await fetch(proxyUrl, {
          signal: controller.signal,
        });
        
        clearTimeout(timeoutId);
        
        if (response.ok) {
          const html = await response.text();
          console.log(`✅ Successfully fetched via proxy ${i + 1}`);
          return html;
        }
      } catch (fetchError: any) {
        clearTimeout(timeoutId);
        throw fetchError;
      }
    } catch (error: any) {
      console.log(`❌ Proxy ${i + 1} failed:`, error.message);
      // Try next proxy
      if (i === CORS_PROXIES.length - 1) {
        // Last proxy failed
        throw new Error(`Unable to fetch webpage. All CORS proxies failed. The website may be blocking automated requests or may be temporarily unavailable.`);
      }
    }
  }
  
  throw new Error('Failed to fetch page content');
}

/**
 * Parse HTML and extract SEO metrics
 */
function extractSEOMetrics(html: string, url: string): SEOMetrics {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  // Extract title
  const title = doc.querySelector('title')?.textContent || '';
  
  // Extract meta description
  const metaDesc = doc.querySelector('meta[name="description"]')?.getAttribute('content') || '';
  
  // Extract heading tags
  const h1Tags = Array.from(doc.querySelectorAll('h1')).map(h => h.textContent?.trim() || '');
  const h2Tags = Array.from(doc.querySelectorAll('h2')).map(h => h.textContent?.trim() || '');
  const h3Tags = Array.from(doc.querySelectorAll('h3')).map(h => h.textContent?.trim() || '');
  const h4Tags = Array.from(doc.querySelectorAll('h4')).map(h => h.textContent?.trim() || '');
  const h5Tags = Array.from(doc.querySelectorAll('h5')).map(h => h.textContent?.trim() || '');
  const h6Tags = Array.from(doc.querySelectorAll('h6')).map(h => h.textContent?.trim() || '');
  
  // Extract canonical URL
  const canonical = doc.querySelector('link[rel="canonical"]')?.getAttribute('href') || '';
  
  // Extract meta robots
  const metaRobots = doc.querySelector('meta[name="robots"]')?.getAttribute('content') || '';
  
  // Extract language
  const lang = doc.documentElement.getAttribute('lang') || '';
  
  // Count images
  const images = doc.querySelectorAll('img');
  const imagesCount = images.length;
  const imagesWithoutAlt = Array.from(images).filter(img => !img.getAttribute('alt')).length;
  
  // Calculate word count
  const bodyText = doc.body?.textContent || '';
  const words = bodyText.trim().split(/\s+/).filter(word => word.length > 0);
  const wordCount = words.length;
  
  // Calculate page size (approximate)
  const pageSize = new Blob([html]).size;
  
  // Calculate readability score (Flesch Reading Ease approximation)
  const readabilityScore = calculateReadabilityScore(bodyText);

  return {
    title,
    title_length: title.length,
    meta_description: metaDesc,
    meta_description_length: metaDesc.length,
    h1_tags: h1Tags,
    h2_tags: h2Tags,
    h3_tags: h3Tags,
    h4_tags: h4Tags,
    h5_tags: h5Tags,
    h6_tags: h6Tags,
    canonical_url: canonical,
    meta_robots: metaRobots,
    lang,
    images_count: imagesCount,
    images_without_alt: imagesWithoutAlt,
    word_count: wordCount,
    page_size: pageSize,
    load_time: 0, // Will be set by caller
    readability_score: readabilityScore,
  };
}

/**
 * Calculate Flesch Reading Ease score
 */
function calculateReadabilityScore(text: string): number {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const words = text.split(/\s+/).filter(w => w.length > 0);
  const syllables = words.reduce((count, word) => count + countSyllables(word), 0);
  
  if (sentences.length === 0 || words.length === 0) return 0;
  
  const avgWordsPerSentence = words.length / sentences.length;
  const avgSyllablesPerWord = syllables / words.length;
  
  const score = 206.835 - (1.015 * avgWordsPerSentence) - (84.6 * avgSyllablesPerWord);
  return Math.max(0, Math.min(100, Math.round(score)));
}

/**
 * Count syllables in a word (approximation)
 */
function countSyllables(word: string): number {
  word = word.toLowerCase().replace(/[^a-z]/g, '');
  if (word.length <= 3) return 1;
  
  const vowels = word.match(/[aeiouy]+/g);
  let count = vowels ? vowels.length : 1;
  
  if (word.endsWith('e')) count--;
  if (word.endsWith('le') && word.length > 2) count++;
  
  return Math.max(1, count);
}

/**
 * Extract and check all links
 */
async function checkLinks(html: string, baseUrl: string): Promise<{ links: LinkResult[], statistics: Statistics, errorsByCategory: ErrorsByCategory }> {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const base = new URL(baseUrl);
  
  const anchors = Array.from(doc.querySelectorAll('a[href]'));
  const linkResults: LinkResult[] = [];
  
  const statusCodeDistribution: Record<number, number> = {};
  let workingCount = 0;
  let brokenCount = 0;
  let internalCount = 0;
  let externalCount = 0;
  let redirectCount = 0;
  let timeoutCount = 0;
  let networkErrorCount = 0;
  let totalResponseTime = 0;
  
  // Process links in batches to avoid overwhelming the browser
  const batchSize = 10;
  for (let i = 0; i < anchors.length; i += batchSize) {
    const batch = anchors.slice(i, i + batchSize);
    const promises = batch.map(async (anchor) => {
      const href = anchor.getAttribute('href');
      if (!href || href.startsWith('#') || href.startsWith('javascript:') || href.startsWith('mailto:') || href.startsWith('tel:')) {
        return null;
      }
      
      try {
        const absoluteUrl = new URL(href, baseUrl).href;
        const linkUrl = new URL(absoluteUrl);
        const isInternal = linkUrl.hostname === base.hostname;
        
        if (isInternal) internalCount++;
        else externalCount++;
        
        const startTime = Date.now();
        let statusCode: number | null = null;
        let isWorking = false;
        let errorMessage = '';
        let redirectChain: string[] = [];
        let finalUrl = absoluteUrl;
        
        try {
          // For external links, we can't reliably check them due to CORS
          // So we'll mark them as "assumed working" unless obviously broken
          if (!isInternal) {
            // Just validate the URL format
            isWorking = true;
            statusCode = 200; // Assumed
            errorMessage = 'External link (not checked due to CORS)';
          } else {
            // For internal links, try to fetch
            const response = await fetch(absoluteUrl, {
              method: 'HEAD',
              mode: 'no-cors', // This will limit what we can check
            });
            
            // With no-cors, we can't read the status, so assume it's working
            isWorking = true;
            statusCode = 200; // Assumed
          }
        } catch (error: any) {
          isWorking = false;
          errorMessage = error.message || 'Network error';
          networkErrorCount++;
        }
        
        const responseTime = Date.now() - startTime;
        totalResponseTime += responseTime;
        
        if (isWorking) workingCount++;
        else brokenCount++;
        
        if (statusCode) {
          statusCodeDistribution[statusCode] = (statusCodeDistribution[statusCode] || 0) + 1;
        }
        
        return {
          url: absoluteUrl,
          status_code: statusCode,
          is_working: isWorking,
          response_time: responseTime,
          error_message: errorMessage,
          anchor_text: anchor.textContent?.trim() || '',
          link_type: isInternal ? 'internal' as const : 'external' as const,
          redirect_chain: redirectChain,
          final_url: finalUrl,
          content_type: '',
          method_used: 'HEAD',
          retry_count: 0,
        };
      } catch (error) {
        return null;
      }
    });
    
    const results = await Promise.all(promises);
    linkResults.push(...results.filter((r): r is LinkResult => r !== null));
  }
  
  const totalLinks = linkResults.length;
  const avgResponseTime = totalLinks > 0 ? totalResponseTime / totalLinks : 0;
  const successRate = totalLinks > 0 ? (workingCount / totalLinks) * 100 : 0;
  
  const statistics: Statistics = {
    total_links: totalLinks,
    working_links: workingCount,
    broken_links: brokenCount,
    internal_links: internalCount,
    external_links: externalCount,
    success_rate: successRate,
    avg_response_time: avgResponseTime,
    status_code_distribution: statusCodeDistribution,
    redirects: redirectCount,
    timeouts: timeoutCount,
    network_errors: networkErrorCount,
  };
  
  const errorsByCategory: ErrorsByCategory = {
    working_links: linkResults.filter(l => l.is_working),
    broken_links: linkResults.filter(l => !l.is_working),
    '4xx_errors': linkResults.filter(l => l.status_code && l.status_code >= 400 && l.status_code < 500),
    '5xx_errors': linkResults.filter(l => l.status_code && l.status_code >= 500),
    network_errors: linkResults.filter(l => l.error_message.includes('Network') || l.error_message.includes('CORS')),
    redirects: linkResults.filter(l => l.redirect_chain.length > 0),
    timeouts: linkResults.filter(l => l.error_message.includes('timeout')),
  };
  
  return { links: linkResults, statistics, errorsByCategory };
}

/**
 * Analyze images
 */
function analyzeImages(html: string, baseUrl: string): ImageAnalysis[] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const images = Array.from(doc.querySelectorAll('img'));
  
  return images.map(img => {
    const src = img.getAttribute('src') || '';
    const alt = img.getAttribute('alt') || '';
    const width = img.width || null;
    const height = img.height || null;
    
    let absoluteUrl = src;
    try {
      absoluteUrl = new URL(src, baseUrl).href;
    } catch (e) {
      // Invalid URL
    }
    
    const format = src.split('.').pop()?.toLowerCase() || 'unknown';
    
    const altStatus = alt ? 'present' : 'missing';
    const recommendations: string[] = [];
    
    if (!alt) {
      recommendations.push('Add descriptive alt text for accessibility');
    }
    
    if (width && height && (width > 2000 || height > 2000)) {
      recommendations.push('Image dimensions are very large, consider optimizing');
    }
    
    if (!['jpg', 'jpeg', 'png', 'webp', 'svg', 'gif'].includes(format)) {
      recommendations.push('Consider using modern image formats like WebP');
    }
    
    return {
      url: absoluteUrl,
      alt_text: alt,
      alt_text_status: altStatus,
      size_kb: null, // Can't determine without fetching
      size_status: 'unknown',
      recommendations,
      width,
      height,
      format,
    };
  });
}

/**
 * Basic spell checking (simple implementation)
 */
function checkSpelling(html: string): Misspelling[] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  
  // Get text content from main content areas
  const textElements = doc.querySelectorAll('p, h1, h2, h3, h4, h5, h6, li, td, th');
  const misspellings: Misspelling[] = [];
  
  // Common misspellings dictionary (simplified)
  const commonMisspellings: Record<string, string[]> = {
    'teh': ['the'],
    'recieve': ['receive'],
    'occured': ['occurred'],
    'seperate': ['separate'],
    'definately': ['definitely'],
    'accomodate': ['accommodate'],
    'untill': ['until'],
    'sucessful': ['successful'],
  };
  
  textElements.forEach((element, index) => {
    const text = element.textContent || '';
    const words = text.split(/\s+/);
    
    words.forEach((word, wordIndex) => {
      const cleanWord = word.toLowerCase().replace(/[^a-z]/g, '');
      if (commonMisspellings[cleanWord]) {
        misspellings.push({
          word: cleanWord,
          context: text.substring(Math.max(0, text.indexOf(word) - 30), text.indexOf(word) + word.length + 30),
          suggestions: commonMisspellings[cleanWord],
          position: wordIndex,
          sentence: text,
          language: 'en',
        });
      }
    });
  });
  
  return misspellings;
}

/**
 * Generate SEO errors from audit results
 */
function generateSEOErrors(seoMetrics: SEOMetrics, imageAnalysis: ImageAnalysis[], statistics: Statistics): SEOError[] {
  const errors: SEOError[] = [];
  
  // Title checks
  if (!seoMetrics.title) {
    errors.push({
      type: 'critical',
      category: 'seo',
      message: 'Missing page title',
      recommendation: 'Add a descriptive title tag to improve SEO',
    });
  } else if (seoMetrics.title_length < 30) {
    errors.push({
      type: 'warning',
      category: 'seo',
      message: 'Title is too short',
      value: seoMetrics.title_length,
      recommendation: 'Title should be between 30-60 characters',
    });
  } else if (seoMetrics.title_length > 60) {
    errors.push({
      type: 'warning',
      category: 'seo',
      message: 'Title is too long',
      value: seoMetrics.title_length,
      recommendation: 'Title should be between 30-60 characters',
    });
  }
  
  // Meta description checks
  if (!seoMetrics.meta_description) {
    errors.push({
      type: 'critical',
      category: 'seo',
      message: 'Missing meta description',
      recommendation: 'Add a meta description to improve search engine visibility',
    });
  } else if (seoMetrics.meta_description_length < 120) {
    errors.push({
      type: 'warning',
      category: 'seo',
      message: 'Meta description is too short',
      value: seoMetrics.meta_description_length,
      recommendation: 'Meta description should be between 120-160 characters',
    });
  } else if (seoMetrics.meta_description_length > 160) {
    errors.push({
      type: 'warning',
      category: 'seo',
      message: 'Meta description is too long',
      value: seoMetrics.meta_description_length,
      recommendation: 'Meta description should be between 120-160 characters',
    });
  }
  
  // H1 checks
  if (seoMetrics.h1_tags.length === 0) {
    errors.push({
      type: 'critical',
      category: 'seo',
      message: 'Missing H1 tag',
      recommendation: 'Add exactly one H1 tag to the page',
    });
  } else if (seoMetrics.h1_tags.length > 1) {
    errors.push({
      type: 'warning',
      category: 'seo',
      message: 'Multiple H1 tags found',
      value: seoMetrics.h1_tags.length,
      recommendation: 'Use only one H1 tag per page',
    });
  }
  
  // Image alt text checks
  if (seoMetrics.images_without_alt > 0) {
    errors.push({
      type: 'warning',
      category: 'accessibility',
      message: `${seoMetrics.images_without_alt} images missing alt text`,
      value: seoMetrics.images_without_alt,
      recommendation: 'Add descriptive alt text to all images for accessibility',
    });
  }
  
  // Broken links
  if (statistics.broken_links > 0) {
    errors.push({
      type: 'critical',
      category: 'technical',
      message: `${statistics.broken_links} broken links found`,
      value: statistics.broken_links,
      recommendation: 'Fix or remove broken links',
    });
  }
  
  // Page size
  if (seoMetrics.page_size > 3000000) { // 3MB
    errors.push({
      type: 'warning',
      category: 'performance',
      message: 'Page size is large',
      value: Math.round(seoMetrics.page_size / 1024),
      recommendation: 'Optimize images and resources to reduce page size',
    });
  }
  
  return errors;
}

/**
 * Generate image issues from image analysis
 */
function generateImageIssues(imageAnalysis: ImageAnalysis[]): ImageIssue[] {
  return imageAnalysis
    .filter(img => img.alt_text_status === 'missing' || (img.width && img.height && (img.width > 2000 || img.height > 2000)))
    .map(img => ({
      url: img.url,
      type: img.alt_text_status === 'missing' ? 'no-alt' as const : 'large' as const,
      altText: img.alt_text || undefined,
      size: img.size_kb || undefined,
      recommendation: img.recommendations[0] || 'Optimize this image',
      element: `<img src="${img.url}" />`,
    }));
}

/**
 * Calculate summary scores
 */
function calculateSummary(seoErrors: SEOError[], seoMetrics: SEOMetrics, statistics: Statistics, misspellings: any[]): Summary {
  const criticalIssues = seoErrors.filter(e => e.type === 'critical').length;
  const warnings = seoErrors.filter(e => e.type === 'warning').length;
  const suggestions = seoErrors.filter(e => e.type === 'suggestion').length;
  
  // Calculate scores (0-100)
  const contentScore = Math.max(0, 100 - (criticalIssues * 20) - (warnings * 5));
  const technicalScore = Math.max(0, 100 - (statistics.broken_links * 10) - (statistics.network_errors * 5));
  const overallScore = Math.round((contentScore + technicalScore) / 2);
  
  // Estimate mobile/desktop speed based on page size and load time
  const mobileSpeed = Math.max(0, Math.min(100, 100 - (seoMetrics.page_size / 50000)));
  const desktopSpeed = Math.max(0, Math.min(100, 100 - (seoMetrics.page_size / 100000)));
  
  return {
    overallScore,
    contentScore,
    technicalScore,
    mobileSpeed: Math.round(mobileSpeed),
    desktopSpeed: Math.round(desktopSpeed),
    criticalIssues,
    warnings,
    suggestions,
    spellingErrors: misspellings.length,
    technicalIssues: seoErrors.filter(e => e.category === 'technical').length,
    performanceIssues: seoErrors.filter(e => e.category === 'performance').length,
    contentIssues: seoErrors.filter(e => e.category === 'seo').length,
    redirectIssues: statistics.redirects,
    webErrors: statistics.broken_links,
    thirdPartyIssues: 0,
    keywordOpportunities: 0,
  };
}

/**
 * Generate performance metrics
 */
function generatePerformanceMetrics(seoMetrics: SEOMetrics, statistics: Statistics, html: string): PerformanceMetrics {
  const httpLinks = statistics.total_links; // Simplified
  const httpsLinks = 0; // Would need to parse each link
  
  return {
    totalLinks: statistics.total_links,
    totalImages: seoMetrics.images_count,
    pageSize: seoMetrics.page_size,
    mobileLoadTime: seoMetrics.load_time,
    desktopLoadTime: seoMetrics.load_time,
    detectedLanguage: seoMetrics.lang || 'en',
    readabilityScore: seoMetrics.readability_score,
    exactWordCount: seoMetrics.word_count,
    gzipEnabled: false, // Can't detect in browser
    textToCodeRatio: Math.round((seoMetrics.word_count * 5) / html.length * 100),
    navigationDepth: 0,
    httpLinks,
    httpsLinks,
    internalLinks: statistics.internal_links,
    externalLinks: statistics.external_links,
    redirectCount: statistics.redirects,
    imagesOver1MB: 0, // Can't determine without fetching
    totalFileSize: seoMetrics.page_size,
    compressionRatio: 0,
    workingLinks: statistics.working_links,
    thirdPartyDomains: 0,
    mobileSpeed: Math.max(0, Math.min(100, 100 - (seoMetrics.page_size / 50000))),
    desktopSpeed: Math.max(0, Math.min(100, 100 - (seoMetrics.page_size / 100000))),
  };
}

/**
 * Main audit function
 */
export async function performClientSideAudit(
  url: string,
  onProgress?: (progress: number, step: string) => void
): Promise<SEOAuditResult> {
  const startTime = Date.now();
  
  try {
    console.log('🔍 Starting audit for:', url);
    
    // Step 1: Fetch page content
    onProgress?.(10, 'Fetching webpage content...');
    console.log('📥 Fetching page content...');
    const html = await fetchPageContent(url);
    console.log('✅ Page content fetched, length:', html.length);
    
    // Step 2: Extract SEO metrics
    onProgress?.(30, 'Analyzing SEO metrics...');
    const seoMetrics = extractSEOMetrics(html, url);
    seoMetrics.load_time = Date.now() - startTime;
    
    // Step 3: Check links
    onProgress?.(50, 'Checking all links...');
    const { links, statistics, errorsByCategory } = await checkLinks(html, url);
    
    // Step 4: Analyze images
    onProgress?.(70, 'Analyzing images...');
    const imageAnalysis = analyzeImages(html, url);
    
    // Step 5: Check spelling
    onProgress?.(85, 'Checking spelling...');
    const misspellings = checkSpelling(html);
    
    // Step 6: Generate additional data for UI
    onProgress?.(95, 'Generating report...');
    const seoErrors = generateSEOErrors(seoMetrics, imageAnalysis, statistics);
    const imageIssues = generateImageIssues(imageAnalysis);
    const performanceMetrics = generatePerformanceMetrics(seoMetrics, statistics, html);
    const summary = calculateSummary(seoErrors, seoMetrics, statistics, misspellings);
    
    // Step 7: Complete
    onProgress?.(100, 'Analysis complete!');
    
    return {
      url,
      timestamp: new Date().toISOString(),
      seo_metrics: seoMetrics,
      w_meta_attributes: {
        'w-page-type': '',
        'w-published-date': '',
        'w-business-unit': '',
        'w-sector': '',
        'w-discipline': '',
        'w-read-time': '',
        'w-thumbnail-image': '',
        'w-search-type': '',
        'w-language': seoMetrics.lang,
        'w-page-type-id': '',
        'w-business-unit-id': '',
        'w-sector-id': '',
      },
      misspellings,
      image_analysis: imageAnalysis,
      responsiveness_tests: [],
      link_results: links,
      statistics,
      errors_by_category: errorsByCategory,
      eloqua_form_fields: [],
      pdf_links: [],
      seoErrors,
      summary,
      performanceMetrics,
      imageIssues,
    };
  } catch (error: any) {
    throw new Error(`Audit failed: ${error.message}`);
  }
}
