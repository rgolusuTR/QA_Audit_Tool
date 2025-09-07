import axios from 'axios';
import { parse } from 'node-html-parser';

export interface LinkCheckResult {
  url: string;
  status: number | null;
  statusText: string;
  isWorking: boolean;
  responseTime: number;
  error?: string;
  redirectChain?: string[];
  finalUrl?: string;
  anchor: string;
  linkType: 'internal' | 'external';
  method: 'HEAD' | 'GET' | 'PROXY';
  headers?: Record<string, string>;
  contentType?: string;
  lastModified?: string;
  contentLength?: number;
  corsIssue?: boolean;
  retryCount?: number;
}

export interface LinkCheckStats {
  totalLinks: number;
  workingLinks: number;
  brokenLinks: number;
  internalLinks: number;
  externalLinks: number;
  redirects: number;
  timeouts: number;
  corsErrors: number;
  proxyUsed: number;
  avgResponseTime: number;
  successRate: number;
}

// Professional CORS proxy services
const CORS_PROXIES = [
  'https://api.codetabs.com/v1/proxy?quest=',
  'https://api.allorigins.win/raw?url=',
  'https://corsproxy.io/?',
  'https://cors-anywhere.herokuapp.com/',
  'https://thingproxy.freeboard.io/fetch/'
];

export class ProfessionalLinkChecker {
  private baseUrl: string;
  private baseDomain: string;
  private timeout: number;
  private maxRetries: number;
  private concurrency: number;
  private userAgent: string;
  private results: LinkCheckResult[] = [];
  private stats: LinkCheckStats;
  private onProgress?: (progress: { current: number; total: number; url: string }) => void;

  constructor(
    baseUrl: string,
    options: {
      timeout?: number;
      maxRetries?: number;
      concurrency?: number;
      userAgent?: string;
      onProgress?: (progress: { current: number; total: number; url: string }) => void;
    } = {}
  ) {
    this.baseUrl = baseUrl;
    this.baseDomain = new URL(baseUrl).hostname;
    this.timeout = options.timeout || 15000;
    this.maxRetries = options.maxRetries || 3;
    this.concurrency = options.concurrency || 5;
    this.userAgent = options.userAgent || 'Professional-Link-Checker/2.0 (SEO Audit Tool)';
    this.onProgress = options.onProgress;
    
    this.stats = {
      totalLinks: 0,
      workingLinks: 0,
      brokenLinks: 0,
      internalLinks: 0,
      externalLinks: 0,
      redirects: 0,
      timeouts: 0,
      corsErrors: 0,
      proxyUsed: 0,
      avgResponseTime: 0,
      successRate: 0
    };
  }

  async checkAllLinks(): Promise<{ results: LinkCheckResult[]; stats: LinkCheckStats }> {
    console.log(`Starting professional link check for: ${this.baseUrl}`);
    
    try {
      // Extract all links from the page
      const links = await this.extractAllLinks();
      console.log(`Found ${links.length} links to check`);
      
      this.stats.totalLinks = links.length;
      
      // Check links in batches for better performance
      await this.checkLinksInBatches(links);
      
      // Calculate final statistics
      this.calculateFinalStats();
      
      console.log('Professional link check completed:', this.stats);
      return { results: this.results, stats: this.stats };
      
    } catch (error) {
      console.error('Professional link check failed:', error);
      throw error;
    }
  }

  private async extractAllLinks(): Promise<Array<{ url: string; anchor: string; element: string }>> {
    const html = await this.fetchPageContent(this.baseUrl);
    if (!html) {
      throw new Error('Failed to fetch page content');
    }

    const root = parse(html);
    const links: Array<{ url: string; anchor: string; element: string }> = [];
    
    // Extract all anchor tags with href attributes
    const anchorElements = root.querySelectorAll('a[href]');
    
    anchorElements.forEach((element) => {
      const href = element.getAttribute('href');
      if (!href || this.shouldSkipLink(href)) return;
      
      try {
        const absoluteUrl = new URL(href, this.baseUrl).href;
        const anchor = element.text.trim() || element.getAttribute('title') || href;
        
        // Only include HTTP/HTTPS links
        if (absoluteUrl.startsWith('http://') || absoluteUrl.startsWith('https://')) {
          links.push({
            url: absoluteUrl,
            anchor: anchor.length > 100 ? anchor.substring(0, 100) + '...' : anchor,
            element: element.outerHTML
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

    console.log(`Extracted ${uniqueLinks.length} unique links`);
    return uniqueLinks;
  }

  private async fetchPageContent(url: string): Promise<string | null> {
    // First try direct request
    try {
      const response = await axios.get(url, {
        timeout: this.timeout,
        headers: {
          'User-Agent': this.userAgent,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate, br',
          'DNT': '1',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1'
        }
      });
      
      return response.data;
    } catch (error: any) {
      console.warn(`Direct request failed for ${url}, trying CORS proxies:`, error.message);
      
      // If direct request fails (likely due to CORS), try proxy servers
      return await this.fetchPageContentViaProxy(url);
    }
  }

  private async fetchPageContentViaProxy(url: string): Promise<string | null> {
    let lastError: string | undefined;
    
    for (const proxy of CORS_PROXIES) {
      try {
        console.log(`Trying proxy: ${proxy} for ${url}`);
        const proxyUrl = `${proxy}${encodeURIComponent(url)}`;
        
        const response = await axios.get(proxyUrl, {
          timeout: this.timeout + 5000, // Extra time for proxy
          headers: {
            'User-Agent': this.userAgent,
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5'
          }
        });
        
        console.log(`Successfully fetched ${url} via proxy: ${proxy}`);
        this.stats.proxyUsed++;
        return response.data;
        
      } catch (error: any) {
        lastError = error.message;
        console.warn(`Proxy ${proxy} failed for ${url}:`, lastError);
        continue;
      }
    }
    
    console.error(`All proxy attempts failed for ${url}. Last error:`, lastError);
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

  private async checkLinksInBatches(links: Array<{ url: string; anchor: string; element: string }>): Promise<void> {
    const batchSize = this.concurrency;
    
    for (let i = 0; i < links.length; i += batchSize) {
      const batch = links.slice(i, i + batchSize);
      const batchPromises = batch.map(link => this.checkSingleLink(link));
      
      try {
        await Promise.allSettled(batchPromises);
      } catch (error) {
        console.error('Batch processing error:', error);
      }
      
      // Report progress
      if (this.onProgress) {
        this.onProgress({
          current: Math.min(i + batchSize, links.length),
          total: links.length,
          url: batch[0]?.url || ''
        });
      }
      
      // Add delay between batches to avoid overwhelming servers
      if (i + batchSize < links.length) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
  }

  private async checkSingleLink(link: { url: string; anchor: string; element: string }): Promise<void> {
    const startTime = Date.now();
    let retryCount = 0;
    let lastError: string | undefined;
    
    const isInternal = this.isInternalLink(link.url);
    const isCrossOrigin = !isInternal;
    
    // Update stats
    if (isInternal) {
      this.stats.internalLinks++;
    } else {
      this.stats.externalLinks++;
    }

    while (retryCount <= this.maxRetries) {
      try {
        // Try different methods based on retry count and link type
        let result: LinkCheckResult;
        
        if (retryCount === 0) {
          // First attempt: HEAD request
          result = await this.makeHeadRequest(link, startTime, isInternal);
        } else if (retryCount === 1) {
          // Second attempt: GET request
          result = await this.makeGetRequest(link, startTime, isInternal);
        } else {
          // Final attempts: Proxy requests for cross-origin links
          if (isCrossOrigin) {
            result = await this.makeProxyRequest(link, startTime);
            this.stats.proxyUsed++;
          } else {
            // For internal links, try GET again with different headers
            result = await this.makeGetRequest(link, startTime, isInternal, true);
          }
        }

        result.retryCount = retryCount;
        this.results.push(result);
        
        // Update stats
        if (result.isWorking) {
          this.stats.workingLinks++;
          if (result.redirectChain && result.redirectChain.length > 1) {
            this.stats.redirects++;
          }
        } else {
          this.stats.brokenLinks++;
          if (result.corsIssue) {
            this.stats.corsErrors++;
          }
          if (result.error?.includes('timeout')) {
            this.stats.timeouts++;
          }
        }
        
        console.log(`✓ Checked: ${link.url} (${result.status}) [${result.method}] - Retry: ${retryCount}`);
        return;
        
      } catch (error: any) {
        lastError = error.message || 'Unknown error';
        retryCount++;
        
        if (retryCount <= this.maxRetries) {
          console.log(`Retry ${retryCount} for ${link.url}: ${lastError}`);
          await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
        }
      }
    }

    // All retries failed
    const responseTime = Date.now() - startTime;
    const failedResult: LinkCheckResult = {
      url: link.url,
      status: null,
      statusText: 'Failed',
      isWorking: false,
      responseTime,
      error: lastError || 'All retry attempts failed',
      anchor: link.anchor,
      linkType: isInternal ? 'internal' : 'external',
      method: 'GET',
      retryCount: this.maxRetries
    };

    this.results.push(failedResult);
    this.stats.brokenLinks++;
    console.log(`✗ Failed: ${link.url} - ${failedResult.error}`);
  }

  private async makeHeadRequest(
    link: { url: string; anchor: string; element: string },
    startTime: number,
    isInternal: boolean
  ): Promise<LinkCheckResult> {
    const response = await axios.head(link.url, {
      timeout: this.timeout,
      headers: {
        'User-Agent': this.userAgent,
        'Accept': '*/*',
        'Accept-Language': 'en-US,en;q=0.5',
        'DNT': '1',
        'Connection': 'keep-alive'
      },
      maxRedirects: 5,
      validateStatus: (status) => status < 500
    });

    const responseTime = Date.now() - startTime;
    
    return {
      url: link.url,
      status: response.status,
      statusText: response.statusText,
      isWorking: response.status >= 200 && response.status < 400,
      responseTime,
      anchor: link.anchor,
      linkType: isInternal ? 'internal' : 'external',
      method: 'HEAD',
      headers: response.headers,
      contentType: response.headers['content-type'],
      lastModified: response.headers['last-modified'],
      contentLength: parseInt(response.headers['content-length'] || '0'),
      finalUrl: response.request?.responseURL || link.url,
      redirectChain: this.extractRedirectChain(response)
    };
  }

  private async makeGetRequest(
    link: { url: string; anchor: string; element: string },
    startTime: number,
    isInternal: boolean,
    useAlternativeHeaders = false
  ): Promise<LinkCheckResult> {
    const headers = useAlternativeHeaders ? {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5',
      'Accept-Encoding': 'gzip, deflate, br',
      'DNT': '1',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1',
      'Cache-Control': 'no-cache'
    } : {
      'User-Agent': this.userAgent,
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5',
      'DNT': '1',
      'Connection': 'keep-alive'
    };

    const response = await axios.get(link.url, {
      timeout: this.timeout,
      headers,
      maxRedirects: 5,
      validateStatus: (status) => status < 500
    });

    const responseTime = Date.now() - startTime;
    
    return {
      url: link.url,
      status: response.status,
      statusText: response.statusText,
      isWorking: response.status >= 200 && response.status < 400,
      responseTime,
      anchor: link.anchor,
      linkType: isInternal ? 'internal' : 'external',
      method: 'GET',
      headers: response.headers,
      contentType: response.headers['content-type'],
      lastModified: response.headers['last-modified'],
      contentLength: response.data?.length || 0,
      finalUrl: response.request?.responseURL || link.url,
      redirectChain: this.extractRedirectChain(response)
    };
  }

  private async makeProxyRequest(
    link: { url: string; anchor: string; element: string },
    startTime: number
  ): Promise<LinkCheckResult> {
    let lastError: string | undefined;
    
    for (const proxy of CORS_PROXIES) {
      try {
        const proxyUrl = `${proxy}${encodeURIComponent(link.url)}`;
        const response = await axios.get(proxyUrl, {
          timeout: this.timeout + 5000,
          headers: {
            'User-Agent': this.userAgent,
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
          },
          validateStatus: (status) => status < 500
        });

        const responseTime = Date.now() - startTime;
        
        return {
          url: link.url,
          status: response.status,
          statusText: response.statusText,
          isWorking: response.status >= 200 && response.status < 400,
          responseTime,
          anchor: link.anchor,
          linkType: 'external',
          method: 'PROXY',
          headers: response.headers,
          contentType: response.headers['content-type'],
          finalUrl: link.url,
          corsIssue: true
        };
        
      } catch (error: any) {
        lastError = error.message;
        console.log(`Proxy ${proxy} failed for ${link.url}: ${lastError}`);
        continue;
      }
    }

    // All proxies failed
    throw new Error(lastError || 'All proxy servers failed');
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

  private extractRedirectChain(response: any): string[] | undefined {
    const redirects: string[] = [];
    
    if (response.request?._redirectable?._redirects) {
      response.request._redirectable._redirects.forEach((redirect: any) => {
        if (redirect.url) {
          redirects.push(redirect.url);
        }
      });
    }
    
    return redirects.length > 0 ? redirects : undefined;
  }

  private calculateFinalStats(): void {
    const totalResponseTime = this.results.reduce((sum, result) => sum + result.responseTime, 0);
    this.stats.avgResponseTime = this.results.length > 0 ? Math.round(totalResponseTime / this.results.length) : 0;
    this.stats.successRate = this.stats.totalLinks > 0 ? Math.round((this.stats.workingLinks / this.stats.totalLinks) * 100) : 0;
  }

  getResults(): LinkCheckResult[] {
    return this.results;
  }

  getStats(): LinkCheckStats {
    return this.stats;
  }

  reset(): void {
    this.results = [];
    this.stats = {
      totalLinks: 0,
      workingLinks: 0,
      brokenLinks: 0,
      internalLinks: 0,
      externalLinks: 0,
      redirects: 0,
      timeouts: 0,
      corsErrors: 0,
      proxyUsed: 0,
      avgResponseTime: 0,
      successRate: 0
    };
  }
}