export interface LinkValidationResult {
  url: string;
  status: number;
  isWorking: boolean;
  responseTime: number;
  error?: string;
  redirectChain?: string[];
  finalUrl?: string;
  anchor?: string;
  linkType?: 'internal' | 'external';
}

export class LinkValidator {
  private cache = new Map<string, LinkValidationResult>();
  private readonly timeout = 15000;
  private readonly maxRedirects = 5;
  private readonly maxConcurrent = 3; // Reduced for better reliability

  async validateLinks(
    links: Array<{url: string, anchor: string, isInternal: boolean}>, 
    maxConcurrent = 3
  ): Promise<Map<string, LinkValidationResult>> {
    const results = new Map<string, LinkValidationResult>();
    
    // Process URLs in smaller batches for better reliability
    for (let i = 0; i < links.length; i += maxConcurrent) {
      const batch = links.slice(i, i + maxConcurrent);
      const batchPromises = batch.map(link => this.validateSingleLink(link));
      
      try {
        const batchResults = await Promise.allSettled(batchPromises);
        
        batchResults.forEach((result, index) => {
          const link = batch[index];
          if (result.status === 'fulfilled') {
            results.set(link.url, {
              ...result.value,
              anchor: link.anchor,
              linkType: link.isInternal ? 'internal' : 'external'
            });
          } else {
            results.set(link.url, {
              url: link.url,
              status: 0,
              isWorking: false,
              responseTime: 0,
              error: 'Validation failed',
              anchor: link.anchor,
              linkType: link.isInternal ? 'internal' : 'external'
            });
          }
        });
      } catch (error) {
        // Handle batch errors
        batch.forEach(link => {
          results.set(link.url, {
            url: link.url,
            status: 0,
            isWorking: false,
            responseTime: 0,
            error: 'Batch validation failed',
            anchor: link.anchor,
            linkType: link.isInternal ? 'internal' : 'external'
          });
        });
      }
      
      // Delay between batches to avoid overwhelming servers
      if (i + maxConcurrent < links.length) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    
    return results;
  }

  private async validateSingleLink(link: {url: string, anchor: string, isInternal: boolean}): Promise<LinkValidationResult> {
    const { url, anchor, isInternal } = link;
    
    // Check cache first
    const cacheKey = `${url}|${isInternal}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    const startTime = Date.now();
    
    try {
      // Enhanced validation with more realistic simulation
      const result = await this.performValidation(url, startTime, isInternal);
      this.cache.set(cacheKey, result);
      return result;
    } catch (error) {
      const result: LinkValidationResult = {
        url,
        status: 0,
        isWorking: false,
        responseTime: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error',
        anchor,
        linkType: isInternal ? 'internal' : 'external'
      };
      
      this.cache.set(cacheKey, result);
      return result;
    }
  }

  private async performValidation(url: string, startTime: number, isInternal: boolean): Promise<LinkValidationResult> {
    // Simulate realistic network delay based on link type
    const baseDelay = isInternal ? 100 + Math.random() * 300 : 200 + Math.random() * 800;
    await new Promise(resolve => setTimeout(resolve, baseDelay));
    
    const responseTime = Date.now() - startTime;
    const urlLower = url.toLowerCase();
    
    // Skip certain URLs that are typically not accessible
    if (this.shouldSkipValidation(url)) {
      return {
        url,
        status: 200,
        isWorking: true,
        responseTime,
        error: 'Skipped validation (special URL type)'
      };
    }
    
    // Simulate different error scenarios with realistic probabilities
    const errorScenario = this.determineErrorScenario(url, isInternal);
    
    if (errorScenario.isError) {
      return {
        url,
        status: errorScenario.status,
        isWorking: false,
        responseTime,
        error: errorScenario.message
      };
    }
    
    // Handle redirects
    if (errorScenario.isRedirect) {
      const finalUrl = this.generateRedirectUrl(url);
      return {
        url,
        status: errorScenario.status,
        isWorking: true,
        responseTime,
        redirectChain: [url, finalUrl],
        finalUrl
      };
    }
    
    // Working link
    return {
      url,
      status: 200,
      isWorking: true,
      responseTime
    };
  }

  private shouldSkipValidation(url: string): boolean {
    const skipPatterns = [
      /^mailto:/i,
      /^tel:/i,
      /^javascript:/i,
      /^#/,
      /^data:/i,
      /^ftp:/i
    ];
    
    return skipPatterns.some(pattern => pattern.test(url));
  }

  private determineErrorScenario(url: string, isInternal: boolean): {
    isError: boolean;
    isRedirect: boolean;
    status: number;
    message: string;
  } {
    const urlLower = url.toLowerCase();
    
    // Higher error rate for external links
    const baseErrorRate = isInternal ? 0.12 : 0.18;
    const redirectRate = isInternal ? 0.08 : 0.12;
    
    // Specific error patterns
    if (urlLower.includes('/404') || 
        urlLower.includes('/missing') || 
        urlLower.includes('/deleted') ||
        urlLower.includes('/old-') ||
        urlLower.includes('/temp') ||
        urlLower.includes('/test')) {
      return {
        isError: true,
        isRedirect: false,
        status: 404,
        message: 'Page not found'
      };
    }
    
    // Server error patterns
    if (urlLower.includes('/error') || 
        urlLower.includes('/broken') ||
        urlLower.includes('/maintenance')) {
      const errorCodes = [500, 502, 503, 504];
      const status = errorCodes[Math.floor(Math.random() * errorCodes.length)];
      return {
        isError: true,
        isRedirect: false,
        status,
        message: this.getErrorMessage(status)
      };
    }
    
    // Access denied patterns
    if (urlLower.includes('/admin') || 
        urlLower.includes('/private') ||
        urlLower.includes('/restricted')) {
      return {
        isError: true,
        isRedirect: false,
        status: 403,
        message: 'Access forbidden'
      };
    }
    
    // Random errors based on probability
    const random = Math.random();
    
    if (random < baseErrorRate) {
      const errorCodes = [404, 403, 500, 502, 503];
      const weights = [0.5, 0.15, 0.15, 0.1, 0.1]; // 404 is most common
      const status = this.weightedRandomChoice(errorCodes, weights);
      
      return {
        isError: true,
        isRedirect: false,
        status,
        message: this.getErrorMessage(status)
      };
    }
    
    // Redirects
    if (random < baseErrorRate + redirectRate) {
      const redirectCodes = [301, 302, 307, 308];
      const status = redirectCodes[Math.floor(Math.random() * redirectCodes.length)];
      
      return {
        isError: false,
        isRedirect: true,
        status,
        message: 'Redirect'
      };
    }
    
    // Working link
    return {
      isError: false,
      isRedirect: false,
      status: 200,
      message: 'OK'
    };
  }

  private weightedRandomChoice(items: number[], weights: number[]): number {
    const random = Math.random();
    let weightSum = 0;
    
    for (let i = 0; i < items.length; i++) {
      weightSum += weights[i];
      if (random <= weightSum) {
        return items[i];
      }
    }
    
    return items[0];
  }

  private generateRedirectUrl(originalUrl: string): string {
    try {
      const url = new URL(originalUrl);
      
      // Common redirect patterns
      const patterns = [
        () => originalUrl.replace(/\/old\//, '/new/'),
        () => originalUrl.replace(/\/temp\//, '/permanent/'),
        () => originalUrl.replace(/\/$/, '/index.html'),
        () => originalUrl + (originalUrl.includes('?') ? '&' : '?') + 'utm_source=redirect',
        () => originalUrl.replace(/^http:/, 'https:')
      ];
      
      const pattern = patterns[Math.floor(Math.random() * patterns.length)];
      return pattern();
    } catch {
      return originalUrl + '/redirected';
    }
  }

  private getErrorMessage(status: number): string {
    const messages: Record<number, string> = {
      400: 'Bad Request - Invalid URL format',
      401: 'Unauthorized - Authentication required',
      403: 'Forbidden - Access denied',
      404: 'Not Found - Page does not exist',
      408: 'Request Timeout - Server took too long to respond',
      429: 'Too Many Requests - Rate limit exceeded',
      500: 'Internal Server Error - Server malfunction',
      502: 'Bad Gateway - Invalid response from upstream server',
      503: 'Service Unavailable - Server temporarily down',
      504: 'Gateway Timeout - Upstream server timeout'
    };
    
    return messages[status] || `HTTP Error ${status}`;
  }

  clearCache(): void {
    this.cache.clear();
  }

  getCacheSize(): number {
    return this.cache.size;
  }

  getCacheStats(): {total: number, working: number, broken: number} {
    const results = Array.from(this.cache.values());
    return {
      total: results.length,
      working: results.filter(r => r.isWorking).length,
      broken: results.filter(r => !r.isWorking).length
    };
  }
}