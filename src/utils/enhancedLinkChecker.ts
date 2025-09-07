import { IFrameLinkChecker, IFrameLinkCheckResult } from './iframeLinkChecker';
import { ProfessionalLinkChecker, LinkCheckResult } from './professionalLinkChecker';

export interface EnhancedLinkCheckResult {
  url: string;
  status: number | null;
  isWorking: boolean;
  responseTime: number;
  error?: string;
  anchor: string;
  linkType: 'internal' | 'external';
  method: 'HEAD' | 'GET' | 'PROXY' | 'IFRAME' | 'HYBRID';
  corsHandled: boolean;
  redirectChain?: string[];
  finalUrl?: string;
  contentType?: string;
  lastModified?: string;
  retryCount?: number;
  validationMethod: 'professional' | 'iframe' | 'hybrid';
}

export interface EnhancedLinkCheckStats {
  totalLinks: number;
  workingLinks: number;
  brokenLinks: number;
  internalLinks: number;
  externalLinks: number;
  redirects: number;
  timeouts: number;
  corsErrors: number;
  corsHandled: number;
  proxyUsed: number;
  iframeUsed: number;
  avgResponseTime: number;
  successRate: number;
  methodBreakdown: {
    professional: number;
    iframe: number;
    hybrid: number;
  };
}

export class EnhancedLinkChecker {
  private baseUrl: string;
  private baseDomain: string;
  private professionalChecker: ProfessionalLinkChecker;
  private iframeChecker: IFrameLinkChecker;
  private onProgress?: (progress: { current: number; total: number; url: string; method: string }) => void;

  constructor(
    baseUrl: string,
    options: {
      timeout?: number;
      maxRetries?: number;
      concurrency?: number;
      onProgress?: (progress: { current: number; total: number; url: string; method: string }) => void;
    } = {}
  ) {
    this.baseUrl = baseUrl;
    this.baseDomain = new URL(baseUrl).hostname;
    
    this.professionalChecker = new ProfessionalLinkChecker(baseUrl, {
      timeout: options.timeout || 15000,
      maxRetries: options.maxRetries || 2,
      concurrency: options.concurrency || 3,
      onProgress: (progress) => {
        if (this.onProgress) {
          this.onProgress({
            ...progress,
            method: 'Professional'
          });
        }
      }
    });
    
    this.iframeChecker = new IFrameLinkChecker({
      timeout: options.timeout || 10000,
      maxConcurrent: options.concurrency || 3
    });
    
    this.onProgress = options.onProgress;
  }

  async checkAllLinks(): Promise<{ results: EnhancedLinkCheckResult[]; stats: EnhancedLinkCheckStats }> {
    console.log(`Starting enhanced link checking with multiple validation methods for: ${this.baseUrl}`);
    
    try {
      // First, run professional link checker
      console.log('Phase 1: Professional link checking...');
      const { results: professionalResults, stats: professionalStats } = await this.professionalChecker.checkAllLinks();
      
      // Identify failed links that might benefit from IFrame checking
      const failedExternalLinks = professionalResults
        .filter(result => !result.isWorking && result.linkType === 'external')
        .map(result => result.url);
      
      console.log(`Phase 2: IFrame validation for ${failedExternalLinks.length} failed external links...`);
      
      // Run IFrame checker on failed external links
      let iframeResults: IFrameLinkCheckResult[] = [];
      if (failedExternalLinks.length > 0) {
        if (this.onProgress) {
          this.onProgress({
            current: 0,
            total: failedExternalLinks.length,
            url: failedExternalLinks[0] || '',
            method: 'IFrame'
          });
        }
        
        iframeResults = await this.iframeChecker.checkLinks(failedExternalLinks);
      }
      
      // Combine and enhance results
      const enhancedResults = this.combineResults(professionalResults, iframeResults);
      const enhancedStats = this.calculateEnhancedStats(enhancedResults, professionalStats);
      
      console.log('Enhanced link checking completed:', enhancedStats);
      
      return {
        results: enhancedResults,
        stats: enhancedStats
      };
      
    } catch (error) {
      console.error('Enhanced link checking failed:', error);
      throw error;
    }
  }

  private combineResults(
    professionalResults: LinkCheckResult[],
    iframeResults: IFrameLinkCheckResult[]
  ): EnhancedLinkCheckResult[] {
    const iframeResultsMap = new Map(iframeResults.map(result => [result.url, result]));
    const enhancedResults: EnhancedLinkCheckResult[] = [];
    
    professionalResults.forEach(professionalResult => {
      const iframeResult = iframeResultsMap.get(professionalResult.url);
      
      // If professional check failed but iframe check succeeded, use iframe result
      if (!professionalResult.isWorking && iframeResult?.isWorking) {
        enhancedResults.push({
          url: professionalResult.url,
          status: iframeResult.status || 200,
          isWorking: true,
          responseTime: professionalResult.responseTime + iframeResult.responseTime,
          anchor: professionalResult.anchor,
          linkType: professionalResult.linkType,
          method: 'IFRAME',
          corsHandled: iframeResult.corsHandled,
          validationMethod: 'hybrid',
          redirectChain: professionalResult.redirectChain,
          finalUrl: professionalResult.finalUrl,
          contentType: professionalResult.contentType,
          lastModified: professionalResult.lastModified,
          retryCount: professionalResult.retryCount
        });
      } else {
        // Use professional result
        enhancedResults.push({
          url: professionalResult.url,
          status: professionalResult.status,
          isWorking: professionalResult.isWorking,
          responseTime: professionalResult.responseTime,
          error: professionalResult.error,
          anchor: professionalResult.anchor,
          linkType: professionalResult.linkType,
          method: professionalResult.method as any,
          corsHandled: professionalResult.corsIssue || false,
          validationMethod: iframeResult ? 'hybrid' : 'professional',
          redirectChain: professionalResult.redirectChain,
          finalUrl: professionalResult.finalUrl,
          contentType: professionalResult.contentType,
          lastModified: professionalResult.lastModified,
          retryCount: professionalResult.retryCount
        });
      }
    });
    
    return enhancedResults;
  }

  private calculateEnhancedStats(
    results: EnhancedLinkCheckResult[],
    professionalStats: any
  ): EnhancedLinkCheckStats {
    const workingLinks = results.filter(r => r.isWorking).length;
    const brokenLinks = results.filter(r => !r.isWorking).length;
    const corsHandled = results.filter(r => r.corsHandled).length;
    const iframeUsed = results.filter(r => r.method === 'IFRAME').length;
    const hybridUsed = results.filter(r => r.validationMethod === 'hybrid').length;
    
    const totalResponseTime = results.reduce((sum, result) => sum + result.responseTime, 0);
    const avgResponseTime = results.length > 0 ? Math.round(totalResponseTime / results.length) : 0;
    const successRate = results.length > 0 ? Math.round((workingLinks / results.length) * 100) : 0;
    
    return {
      totalLinks: results.length,
      workingLinks,
      brokenLinks,
      internalLinks: results.filter(r => r.linkType === 'internal').length,
      externalLinks: results.filter(r => r.linkType === 'external').length,
      redirects: results.filter(r => r.redirectChain && r.redirectChain.length > 1).length,
      timeouts: results.filter(r => r.error?.includes('timeout')).length,
      corsErrors: professionalStats.corsErrors || 0,
      corsHandled,
      proxyUsed: professionalStats.proxyUsed || 0,
      iframeUsed,
      avgResponseTime,
      successRate,
      methodBreakdown: {
        professional: results.filter(r => r.validationMethod === 'professional').length,
        iframe: results.filter(r => r.validationMethod === 'iframe').length,
        hybrid: hybridUsed
      }
    };
  }

  reset(): void {
    this.professionalChecker.reset();
  }
}