import axios from 'axios';
import * as cheerio from 'cheerio';

export interface LinkStatus {
  url: string;
  status: number | null;
  ok: boolean;
  anchor: string;
  responseTime: number;
  error?: string;
  redirectChain?: string[];
  finalUrl?: string;
  method?: 'HEAD' | 'GET' | 'PROXY';
  corsIssue?: boolean;
}

export interface CrawlResult {
  workingLinks: LinkStatus[];
  brokenLinks: LinkStatus[];
  totalLinks: number;
  crawlStats: {
    visited: number;
    errors: number;
    redirects: number;
    avgResponseTime: number;
    corsErrors: number;
    proxyUsed: number;
  };
}

// CORS proxy services for cross-origin requests
const CORS_PROXIES = [
  'https://api.codetabs.com/v1/proxy?quest=',
  'https://api.allorigins.win/raw?url=',
  'https://corsproxy.io/?',
  'https://cors-anywhere.herokuapp.com/',
  'https://thingproxy.freeboard.io/fetch/'
];

export class WebCrawler {
  private visited = new Set<string>();
  private brokenLinks: LinkStatus[] = [];
  private workingLinks: LinkStatus[] = [];
  private baseUrl: string;
  private baseDomain: string;
  private maxDepth: number;
  private maxLinks: number;
  private timeout: number;
  private corsErrorCount = 0;
  private proxyUsedCount = 0;
  private onProgress?: (progress: { current: number; total: number; url: string }) => void;

  constructor(
    baseUrl: string, 
    options: {
      maxDepth?: number;
      maxLinks?: number;
      timeout?: number;
      onProgress?: (progress: { current: number; total: number; url: string }) => void;
    } = {}
  ) {
    this.baseUrl = baseUrl;
    this.baseDomain = new URL(baseUrl).hostname;
    this.maxDepth = options.maxDepth || 2;
    this.maxLinks = options.maxLinks || 100;
    this.timeout = options.timeout || 15000;
    this.onProgress = options.onProgress;
  }

  async crawl(): Promise<CrawlResult> {
    console.log(`Starting comprehensive crawl from ${this.baseUrl}...`);
    
    try {
      await this.crawlPage(this.baseUrl, 0);
    } catch (error) {
      console.error('Crawl failed:', error);
    }

    const totalResponseTime = [...this.workingLinks, ...this.brokenLinks]
      .reduce((sum, link) => sum + link.responseTime, 0);
    const avgResponseTime = totalResponseTime / (this.workingLinks.length + this.brokenLinks.length) || 0;

    const result: CrawlResult = {
      workingLinks: this.workingLinks,
      brokenLinks: this.brokenLinks,
      totalLinks: this.workingLinks.length + this.brokenLinks.length,
      crawlStats: {
        visited: this.visited.size,
        errors: this.brokenLinks.length,
        redirects: this.workingLinks.filter(link => link.redirectChain && link.redirectChain.length > 1).length,
        avgResponseTime: Math.round(avgResponseTime),
        corsErrors: this.corsErrorCount,
        proxyUsed: this.proxyUsedCount
      }
    };

    console.log('Crawl completed:', result.crawlStats);
    console.log(`Working links: ${result.workingLinks.length}`);
    console.log(`Broken links: ${result.brokenLinks.length}`);
    console.log(`CORS errors handled: ${this.corsErrorCount}`);
    console.log(`Proxy requests made: ${this.proxyUsedCount}`);

    return result;
  }

  private async fetchPage(url: string): Promise<string | null> {
    try {
      console.log(`Fetching page: ${url}`);
      
      // Try direct fetch first
      const response = await this.makeRequest(url, 'GET');
      if (response.ok && response.data) {
        return response.data;
      }
      
      // If direct fetch fails due to CORS, try with proxy
      if (response.corsIssue) {
        console.log(`CORS issue detected for ${url}, trying with proxy...`);
        const proxyResponse = await this.makeProxyRequest(url, 'GET');
        if (proxyResponse.ok && proxyResponse.data) {
          return proxyResponse.data;
        }
      }
      
      return null;
    } catch (error) {
      console.log(`Failed to fetch page ${url}:`, error);
      return null;
    }
  }

  private extractLinks(html: string, baseUrl: string): Array<{url: string, anchor: string}> {
    const $ = cheerio.load(html);
    const links: Array<{url: string, anchor: string}> = [];

    $('a[href]').each((_, el) => {
      let href = $(el).attr('href');
      if (!href) return;

      // Skip certain types of links
      if (href.startsWith('javascript:') || 
          href.startsWith('mailto:') || 
          href.startsWith('tel:') || 
          href.startsWith('#') ||
          href.trim() === '') {
        return;
      }

      // Convert relative to absolute
      try {
        const absoluteUrl = new URL(href, baseUrl).href;
        const anchor = $(el).text().trim() || href;
        
        // Only include HTTP/HTTPS links
        if (absoluteUrl.startsWith('http://') || absoluteUrl.startsWith('https://')) {
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

    console.log(`Extracted ${uniqueLinks.length} unique links from ${baseUrl}`);
    return uniqueLinks;
  }

  private async checkLink(url: string, anchor: string): Promise<void> {
    if (this.visited.has(url) || this.visited.size >= this.maxLinks) {
      return;
    }

    this.visited.add(url);
    
    // Report progress
    if (this.onProgress) {
      this.onProgress({
        current: this.visited.size,
        total: Math.min(this.maxLinks, this.visited.size + 10),
        url
      });
    }

    const startTime = Date.now();
    
    try {
      console.log(`Checking link: ${url}`);
      
      // Determine if this is a cross-origin request
      const isCrossOrigin = this.isCrossOrigin(url);
      
      // Try HEAD request first for better performance
      let response = await this.makeRequest(url, 'HEAD');
      
      // If HEAD fails or returns CORS error, try GET
      if (!response.ok || response.corsIssue) {
        console.log(`HEAD request failed for ${url}, trying GET...`);
        response = await this.makeRequest(url, 'GET');
      }
      
      // If still failing due to CORS, try with proxy
      if (!response.ok && response.corsIssue && isCrossOrigin) {
        console.log(`CORS issue detected for ${url}, trying with proxy...`);
        response = await this.makeProxyRequest(url, 'GET');
        this.corsErrorCount++;
      }

      const responseTime = Date.now() - startTime;
      const linkStatus: LinkStatus = {
        url,
        status: response.status,
        ok: response.ok,
        anchor,
        responseTime,
        method: response.method,
        corsIssue: response.corsIssue
      };

      // Handle redirects
      if (response.status && response.status >= 300 && response.status < 400) {
        if (response.redirectChain) {
          linkStatus.redirectChain = response.redirectChain;
          linkStatus.finalUrl = response.finalUrl;
        }
      }

      if (linkStatus.ok) {
        this.workingLinks.push(linkStatus);
        console.log(`✓ Working: ${url} (${response.status}) [${response.method}]`);
      } else {
        linkStatus.error = response.error || `HTTP ${response.status}`;
        this.brokenLinks.push(linkStatus);
        console.log(`✗ Error: ${url} (${response.status || 'N/A'}) - ${linkStatus.error}`);
      }

    } catch (error: any) {
      const responseTime = Date.now() - startTime;
      const linkStatus: LinkStatus = {
        url,
        status: null,
        ok: false,
        anchor,
        responseTime,
        error: error?.message || 'Network error',
        corsIssue: this.isCorsError(error)
      };

      this.brokenLinks.push(linkStatus);
      console.log(`✗ Failed: ${url} - ${linkStatus.error}`);
    }
  }

  private async makeRequest(url: string, method: 'HEAD' | 'GET'): Promise<{
    ok: boolean;
    status: number | null;
    data?: string;
    error?: string;
    corsIssue?: boolean;
    method: 'HEAD' | 'GET';
    redirectChain?: string[];
    finalUrl?: string;
  }> {
    try {
      const config = {
        method,
        url,
        timeout: this.timeout,
        headers: {
          'User-Agent': 'SEO-Audit-Tool/2.0 (Professional SEO Analysis)',
          'Accept': method === 'GET' ? 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8' : '*/*',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate, br',
          'DNT': '1',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
          'Cache-Control': 'no-cache'
        },
        maxRedirects: 5,
        validateStatus: (status: number) => status < 500 // Accept 4xx as "working" but note the error
      };

      const response = await axios(config);
      
      return {
        ok: response.status >= 200 && response.status < 400,
        status: response.status,
        data: method === 'GET' ? response.data : undefined,
        method,
        redirectChain: this.extractRedirectChain(response),
        finalUrl: response.request?.responseURL || url
      };

    } catch (error: any) {
      const corsIssue = this.isCorsError(error);
      
      return {
        ok: false,
        status: error?.response?.status || null,
        error: error?.response?.status ? 
          `HTTP ${error.response.status}` : 
          (error?.code || error?.message || 'Network error'),
        corsIssue,
        method
      };
    }
  }

  private async makeProxyRequest(url: string, method: 'GET'): Promise<{
    ok: boolean;
    status: number | null;
    data?: string;
    error?: string;
    method: 'PROXY';
    redirectChain?: string[];
    finalUrl?: string;
  }> {
    // Try each proxy until one works
    for (const proxy of CORS_PROXIES) {
      try {
        console.log(`Trying proxy: ${proxy} for ${url}`);
        
        const proxyUrl = `${proxy}${encodeURIComponent(url)}`;
        const response = await axios.get(proxyUrl, {
          timeout: this.timeout + 5000, // Extra time for proxy
          headers: {
            'User-Agent': 'SEO-Audit-Tool/2.0 (Proxy Request)',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
          },
          validateStatus: (status: number) => status < 500
        });

        this.proxyUsedCount++;
        
        return {
          ok: response.status >= 200 && response.status < 400,
          status: response.status,
          data: response.data,
          method: 'PROXY',
          finalUrl: url
        };

      } catch (error: any) {
        console.log(`Proxy ${proxy} failed for ${url}:`, error?.message);
        continue;
      }
    }

    // All proxies failed
    return {
      ok: false,
      status: null,
      error: 'All proxy servers failed',
      method: 'PROXY'
    };
  }

  private isCrossOrigin(url: string): boolean {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname !== this.baseDomain;
    } catch {
      return false;
    }
  }

  private isCorsError(error: any): boolean {
    if (!error) return false;
    
    const message = error.message?.toLowerCase() || '';
    const code = error.code?.toLowerCase() || '';
    
    return message.includes('cors') || 
           message.includes('cross-origin') ||
           message.includes('network error') ||
           code === 'err_network' ||
           code === 'err_failed' ||
           (error.response?.status === 0);
  }

  private extractRedirectChain(response: any): string[] | undefined {
    // Extract redirect chain from axios response
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

  private async crawlPage(url: string, depth: number): Promise<void> {
    if (depth > this.maxDepth || this.visited.size >= this.maxLinks) {
      return;
    }

    // First check the page itself
    await this.checkLink(url, 'Page');

    // Only crawl internal pages for deeper analysis
    const urlObj = new URL(url);
    if (urlObj.hostname !== this.baseDomain) {
      return;
    }

    // Fetch page content to extract links
    const html = await this.fetchPage(url);
    if (!html) return;

    const links = this.extractLinks(html, url);
    
    // Check all extracted links
    for (const link of links) {
      if (this.visited.size >= this.maxLinks) break;
      
      await this.checkLink(link.url, link.anchor);
      
      // Add delay to avoid overwhelming servers and respect rate limits
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    // Recursively crawl internal links (with depth limit)
    if (depth < this.maxDepth) {
      const internalLinks = links.filter(link => {
        try {
          const linkUrl = new URL(link.url);
          return linkUrl.hostname === this.baseDomain;
        } catch {
          return false;
        }
      });

      for (const link of internalLinks.slice(0, 3)) { // Limit recursive crawling
        if (this.visited.size >= this.maxLinks) break;
        await this.crawlPage(link.url, depth + 1);
        
        // Add delay between page crawls
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
  }

  // Public method to get current results
  getResults(): CrawlResult {
    const totalResponseTime = [...this.workingLinks, ...this.brokenLinks]
      .reduce((sum, link) => sum + link.responseTime, 0);
    const avgResponseTime = totalResponseTime / (this.workingLinks.length + this.brokenLinks.length) || 0;

    return {
      workingLinks: this.workingLinks,
      brokenLinks: this.brokenLinks,
      totalLinks: this.workingLinks.length + this.brokenLinks.length,
      crawlStats: {
        visited: this.visited.size,
        errors: this.brokenLinks.length,
        redirects: this.workingLinks.filter(link => link.redirectChain && link.redirectChain.length > 1).length,
        avgResponseTime: Math.round(avgResponseTime),
        corsErrors: this.corsErrorCount,
        proxyUsed: this.proxyUsedCount
      }
    };
  }

  // Reset crawler state
  reset(): void {
    this.visited.clear();
    this.brokenLinks = [];
    this.workingLinks = [];
    this.corsErrorCount = 0;
    this.proxyUsedCount = 0;
  }
}