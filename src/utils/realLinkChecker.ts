export interface RealLinkResult {
  url: string;
  status: number | null;
  statusText: string;
  isWorking: boolean;
  responseTime: number;
  error?: string;
  anchor: string;
  linkType: 'internal' | 'external';
  method: 'HEAD' | 'GET' | 'CORS-PROXY';
  redirectChain?: string[];
  finalUrl?: string;
  contentType?: string;
  retryCount: number;
}

export interface RealLinkStats {
  totalLinks: number;
  workingLinks: number;
  brokenLinks: number;
  internalLinks: number;
  externalLinks: number;
  redirects: number;
  timeouts: number;
  corsErrors: number;
  avgResponseTime: number;
  successRate: number;
  statusCodeDistribution: Record<number, number>;
}

// CORS proxy services for cross-origin requests
const CORS_PROXIES = [
  'https://api.codetabs.com/v1/proxy?quest=',
  'https://api.allorigins.win/raw?url=',
  'https://corsproxy.io/?'
];

export class RealLinkChecker {
  private baseUrl: string;
  private baseDomain: string;
  private timeout: number = 15000;
  private maxRetries: number = 3;
  private onProgress?: (progress: { current: number; total: number; url: string }) => void;

  constructor(
    baseUrl: string,
    options: {
      timeout?: number;
      maxRetries?: number;
      onProgress?: (progress: { current: number; total: number; url: string }) => void;
    } = {}
  ) {
    this.baseUrl = baseUrl;
    this.baseDomain = new URL(baseUrl).hostname;
    this.timeout = options.timeout || 15000;
    this.maxRetries = options.maxRetries || 3;
    this.onProgress = options.onProgress;
  }

  async checkAllLinks(): Promise<{ results: RealLinkResult[]; stats: RealLinkStats }> {
    console.log(`🔍 Starting REAL link analysis for: ${this.baseUrl}`);
    
    try {
      // Step 1: Extract all links from the page
      const links = await this.extractLinksFromPage();
      console.log(`📊 Found ${links.length} links to validate`);
      
      if (links.length === 0) {
        return {
          results: [],
          stats: this.generateEmptyStats()
        };
      }

      // Step 2: Validate each link with real HTTP requests
      const results = await this.validateAllLinks(links);
      
      // Step 3: Calculate comprehensive statistics
      const stats = this.calculateStats(results);
      
      console.log(`✅ Real link analysis completed:`, stats);
      return { results, stats };
      
    } catch (error) {
      console.error('❌ Real link analysis failed:', error);
      throw error;
    }
  }

  private async extractLinksFromPage(): Promise<Array<{ url: string; anchor: string }>> {
    try {
      // Fetch the actual page content
      const html = await this.fetchPageContent(this.baseUrl);
      if (!html) {
        throw new Error('Failed to fetch page content');
      }

      // Parse HTML and extract links
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const anchorElements = doc.querySelectorAll('a[href]');
      
      const links: Array<{ url: string; anchor: string }> = [];
      
      anchorElements.forEach((element) => {
        const href = element.getAttribute('href');
        if (!href || this.shouldSkipLink(href)) return;
        
        try {
          // Convert relative URLs to absolute
          const absoluteUrl = new URL(href, this.baseUrl).href;
          
          // Only include HTTP/HTTPS links
          if (absoluteUrl.startsWith('http://') || absoluteUrl.startsWith('https://')) {
            const anchor = element.textContent?.trim() || element.getAttribute('title') || href;
            
            links.push({
              url: absoluteUrl,
              anchor: anchor.length > 100 ? anchor.substring(0, 100) + '...' : anchor
            });
          }
        } catch (error) {
          console.warn(`Invalid URL: ${href}`);
        }
      });

      // Remove duplicates
      const uniqueLinks = links.filter((link, index, self) => 
        index === self.findIndex(l => l.url === link.url)
      );

      console.log(`🔗 Extracted ${uniqueLinks.length} unique links`);
      return uniqueLinks;
      
    } catch (error) {
      console.error('Failed to extract links:', error);
      return [];
    }
  }

  private async fetchPageContent(url: string): Promise<string | null> {
    // Try direct fetch first
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'User-Agent': 'SEO-Audit-Tool/2.0 (Professional Link Checker)',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
        },
        signal: AbortSignal.timeout(this.timeout)
      });
      
      if (response.ok) {
        return await response.text();
      }
    } catch (error) {
      console.warn(`Direct fetch failed for ${url}, trying CORS proxies`);
    }

    // Try CORS proxies if direct fetch fails
    for (const proxy of CORS_PROXIES) {
      try {
        const proxyUrl = `${proxy}${encodeURIComponent(url)}`;
        const response = await fetch(proxyUrl, {
          signal: AbortSignal.timeout(this.timeout + 5000)
        });
        
        if (response.ok) {
          console.log(`✅ Successfully fetched via proxy: ${proxy}`);
          return await response.text();
        }
      } catch (error) {
        console.warn(`Proxy ${proxy} failed:`, error);
        continue;
      }
    }
    
    return null;
  }

  private shouldSkipLink(href: string): boolean {
    const skipPatterns = [
      /^javascript:/i,
      /^mailto:/i,
      /^tel:/i,
      /^ftp:/i,
      /^data:/i,
      /^#$/,
      /^\s*$/
    ];
    
    return skipPatterns.some(pattern => pattern.test(href.trim()));
  }

  private async validateAllLinks(links: Array<{ url: string; anchor: string }>): Promise<RealLinkResult[]> {
    const results: RealLinkResult[] = [];
    const batchSize = 5; // Process in small batches to avoid overwhelming servers
    
    for (let i = 0; i < links.length; i += batchSize) {
      const batch = links.slice(i, i + batchSize);
      const batchPromises = batch.map(link => this.validateSingleLink(link));
      
      try {
        const batchResults = await Promise.allSettled(batchPromises);
        
        batchResults.forEach((result, index) => {
          if (result.status === 'fulfilled') {
            results.push(result.value);
          } else {
            // Handle failed validation
            const link = batch[index];
            results.push({
              url: link.url,
              status: null,
              statusText: 'Failed',
              isWorking: false,
              responseTime: 0,
              error: 'Validation failed',
              anchor: link.anchor,
              linkType: this.isInternalLink(link.url) ? 'internal' : 'external',
              method: 'GET',
              retryCount: this.maxRetries
            });
          }
        });
      } catch (error) {
        console.error('Batch validation error:', error);
      }
      
      // Report progress
      if (this.onProgress) {
        this.onProgress({
          current: Math.min(i + batchSize, links.length),
          total: links.length,
          url: batch[0]?.url || ''
        });
      }
      
      // Add delay between batches
      if (i + batchSize < links.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    return results;
  }

  private async validateSingleLink(link: { url: string; anchor: string }): Promise<RealLinkResult> {
    const startTime = Date.now();
    let retryCount = 0;
    let lastError: string | undefined;
    
    const isInternal = this.isInternalLink(link.url);
    
    while (retryCount <= this.maxRetries) {
      try {
        // Try HEAD request first (faster)
        let response: Response;
        let method: 'HEAD' | 'GET' | 'CORS-PROXY' = 'HEAD';
        
        try {
          response = await fetch(link.url, {
            method: 'HEAD',
            headers: {
              'User-Agent': 'SEO-Audit-Tool/2.0 (Professional Link Checker)',
              'Accept': '*/*'
            },
            signal: AbortSignal.timeout(this.timeout),
            redirect: 'follow'
          });
        } catch (headError) {
          // If HEAD fails, try GET
          method = 'GET';
          response = await fetch(link.url, {
            method: 'GET',
            headers: {
              'User-Agent': 'SEO-Audit-Tool/2.0 (Professional Link Checker)',
              'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
            },
            signal: AbortSignal.timeout(this.timeout),
            redirect: 'follow'
          });
        }

        const responseTime = Date.now() - startTime;
        
        return {
          url: link.url,
          status: response.status,
          statusText: response.statusText,
          isWorking: response.ok,
          responseTime,
          anchor: link.anchor,
          linkType: isInternal ? 'internal' : 'external',
          method,
          finalUrl: response.url,
          contentType: response.headers.get('content-type') || undefined,
          retryCount
        };
        
      } catch (error: any) {
        lastError = error.message || 'Network error';
        
        // If direct request fails due to CORS, try proxy
        if (retryCount === this.maxRetries - 1 && !isInternal) {
          try {
            const proxyResult = await this.validateViaProxy(link.url, link.anchor, startTime);
            return proxyResult;
          } catch (proxyError) {
            lastError = `Proxy failed: ${proxyError}`;
          }
        }
        
        retryCount++;
        if (retryCount <= this.maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
        }
      }
    }

    // All retries failed
    const responseTime = Date.now() - startTime;
    return {
      url: link.url,
      status: null,
      statusText: 'Failed',
      isWorking: false,
      responseTime,
      error: lastError,
      anchor: link.anchor,
      linkType: isInternal ? 'internal' : 'external',
      method: 'GET',
      retryCount: this.maxRetries
    };
  }

  private async validateViaProxy(url: string, anchor: string, startTime: number): Promise<RealLinkResult> {
    for (const proxy of CORS_PROXIES) {
      try {
        const proxyUrl = `${proxy}${encodeURIComponent(url)}`;
        const response = await fetch(proxyUrl, {
          signal: AbortSignal.timeout(this.timeout + 5000)
        });

        const responseTime = Date.now() - startTime;
        
        return {
          url,
          status: response.status,
          statusText: response.statusText,
          isWorking: response.ok,
          responseTime,
          anchor,
          linkType: 'external',
          method: 'CORS-PROXY',
          finalUrl: url,
          retryCount: 0
        };
        
      } catch (error) {
        continue;
      }
    }
    
    throw new Error('All proxy attempts failed');
  }

  private isInternalLink(url: string): boolean {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname === this.baseDomain || 
             urlObj.hostname === `www.${this.baseDomain}` || 
             this.baseDomain === `www.${urlObj.hostname}`;
    } catch {
      return false;
    }
  }

  private calculateStats(results: RealLinkResult[]): RealLinkStats {
    const workingLinks = results.filter(r => r.isWorking).length;
    const brokenLinks = results.filter(r => !r.isWorking).length;
    const internalLinks = results.filter(r => r.linkType === 'internal').length;
    const externalLinks = results.filter(r => r.linkType === 'external').length;
    const redirects = results.filter(r => r.redirectChain && r.redirectChain.length > 1).length;
    const timeouts = results.filter(r => r.error?.includes('timeout')).length;
    const corsErrors = results.filter(r => r.method === 'CORS-PROXY').length;
    
    const totalResponseTime = results.reduce((sum, result) => sum + result.responseTime, 0);
    const avgResponseTime = results.length > 0 ? Math.round(totalResponseTime / results.length) : 0;
    const successRate = results.length > 0 ? Math.round((workingLinks / results.length) * 100) : 0;
    
    // Status code distribution
    const statusCodeDistribution: Record<number, number> = {};
    results.forEach(result => {
      if (result.status) {
        statusCodeDistribution[result.status] = (statusCodeDistribution[result.status] || 0) + 1;
      }
    });
    
    return {
      totalLinks: results.length,
      workingLinks,
      brokenLinks,
      internalLinks,
      externalLinks,
      redirects,
      timeouts,
      corsErrors,
      avgResponseTime,
      successRate,
      statusCodeDistribution
    };
  }

  private generateEmptyStats(): RealLinkStats {
    return {
      totalLinks: 0,
      workingLinks: 0,
      brokenLinks: 0,
      internalLinks: 0,
      externalLinks: 0,
      redirects: 0,
      timeouts: 0,
      corsErrors: 0,
      avgResponseTime: 0,
      successRate: 0,
      statusCodeDistribution: {}
    };
  }
}