export interface IFrameLinkCheckResult {
  url: string;
  status: number | null;
  isWorking: boolean;
  responseTime: number;
  error?: string;
  method: 'IFRAME' | 'PROXY' | 'DIRECT';
  corsHandled: boolean;
}

export class IFrameLinkChecker {
  private timeout: number;
  private maxConcurrent: number;
  private results: Map<string, IFrameLinkCheckResult> = new Map();

  constructor(options: { timeout?: number; maxConcurrent?: number } = {}) {
    this.timeout = options.timeout || 10000;
    this.maxConcurrent = options.maxConcurrent || 3;
  }

  async checkLinks(urls: string[]): Promise<IFrameLinkCheckResult[]> {
    console.log(`Starting IFrame-based link checking for ${urls.length} URLs`);
    
    // Process URLs in batches to avoid overwhelming the browser
    const results: IFrameLinkCheckResult[] = [];
    
    for (let i = 0; i < urls.length; i += this.maxConcurrent) {
      const batch = urls.slice(i, i + this.maxConcurrent);
      const batchPromises = batch.map(url => this.checkSingleLink(url));
      
      const batchResults = await Promise.allSettled(batchPromises);
      
      batchResults.forEach((result, index) => {
        const url = batch[index];
        if (result.status === 'fulfilled') {
          results.push(result.value);
        } else {
          results.push({
            url,
            status: null,
            isWorking: false,
            responseTime: 0,
            error: 'IFrame check failed',
            method: 'IFRAME',
            corsHandled: false
          });
        }
      });
      
      // Add delay between batches
      if (i + this.maxConcurrent < urls.length) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    
    console.log(`IFrame link checking completed. Checked ${results.length} URLs`);
    return results;
  }

  private async checkSingleLink(url: string): Promise<IFrameLinkCheckResult> {
    const startTime = Date.now();
    
    try {
      // First try direct fetch (will work for same-origin and CORS-enabled URLs)
      const directResult = await this.tryDirectFetch(url, startTime);
      if (directResult.isWorking) {
        return directResult;
      }
      
      // If direct fetch fails, try IFrame approach
      const iframeResult = await this.tryIFrameCheck(url, startTime);
      if (iframeResult.isWorking) {
        return iframeResult;
      }
      
      // If IFrame fails, fall back to proxy
      return await this.tryProxyFetch(url, startTime);
      
    } catch (error) {
      return {
        url,
        status: null,
        isWorking: false,
        responseTime: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error',
        method: 'IFRAME',
        corsHandled: false
      };
    }
  }

  private async tryDirectFetch(url: string, startTime: number): Promise<IFrameLinkCheckResult> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);
      
      const response = await fetch(url, {
        method: 'HEAD',
        signal: controller.signal,
        mode: 'cors',
        headers: {
          'User-Agent': 'SEO-Audit-Tool/2.0'
        }
      });
      
      clearTimeout(timeoutId);
      
      return {
        url,
        status: response.status,
        isWorking: response.ok,
        responseTime: Date.now() - startTime,
        method: 'DIRECT',
        corsHandled: true
      };
      
    } catch (error) {
      // If HEAD fails, try GET
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);
        
        const response = await fetch(url, {
          method: 'GET',
          signal: controller.signal,
          mode: 'cors',
          headers: {
            'User-Agent': 'SEO-Audit-Tool/2.0'
          }
        });
        
        clearTimeout(timeoutId);
        
        return {
          url,
          status: response.status,
          isWorking: response.ok,
          responseTime: Date.now() - startTime,
          method: 'DIRECT',
          corsHandled: true
        };
        
      } catch (getError) {
        throw getError;
      }
    }
  }

  private async tryIFrameCheck(url: string, startTime: number): Promise<IFrameLinkCheckResult> {
    return new Promise((resolve) => {
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.style.position = 'absolute';
      iframe.style.left = '-9999px';
      iframe.style.width = '1px';
      iframe.style.height = '1px';
      
      let resolved = false;
      let timeoutId: NodeJS.Timeout;
      
      const cleanup = () => {
        if (timeoutId) clearTimeout(timeoutId);
        if (iframe.parentNode) {
          iframe.parentNode.removeChild(iframe);
        }
        window.removeEventListener('message', messageHandler);
      };
      
      const resolveResult = (result: IFrameLinkCheckResult) => {
        if (!resolved) {
          resolved = true;
          cleanup();
          resolve(result);
        }
      };
      
      // Set up timeout
      timeoutId = setTimeout(() => {
        resolveResult({
          url,
          status: null,
          isWorking: false,
          responseTime: Date.now() - startTime,
          error: 'IFrame timeout',
          method: 'IFRAME',
          corsHandled: false
        });
      }, this.timeout);
      
      // Handle iframe load events
      iframe.onload = () => {
        // IFrame loaded successfully
        resolveResult({
          url,
          status: 200,
          isWorking: true,
          responseTime: Date.now() - startTime,
          method: 'IFRAME',
          corsHandled: true
        });
      };
      
      iframe.onerror = () => {
        // IFrame failed to load
        resolveResult({
          url,
          status: null,
          isWorking: false,
          responseTime: Date.now() - startTime,
          error: 'IFrame load error',
          method: 'IFRAME',
          corsHandled: false
        });
      };
      
      // Handle postMessage communication
      const messageHandler = (event: MessageEvent) => {
        if (event.source === iframe.contentWindow) {
          try {
            const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
            
            if (data.type === 'linkCheck' && data.url === url) {
              resolveResult({
                url,
                status: data.status || 200,
                isWorking: data.success || false,
                responseTime: Date.now() - startTime,
                error: data.error,
                method: 'IFRAME',
                corsHandled: true
              });
            }
          } catch (error) {
            // Ignore invalid messages
          }
        }
      };
      
      window.addEventListener('message', messageHandler);
      
      // Create a simple HTML page that will try to load the target URL
      const iframeContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Link Check</title>
        </head>
        <body>
          <script>
            (function() {
              const targetUrl = '${url.replace(/'/g, "\\'")}';
              
              // Try to fetch the URL
              fetch(targetUrl, { 
                method: 'HEAD',
                mode: 'no-cors'
              })
              .then(response => {
                parent.postMessage({
                  type: 'linkCheck',
                  url: targetUrl,
                  status: response.status,
                  success: response.ok
                }, '*');
              })
              .catch(error => {
                // Try with GET if HEAD fails
                fetch(targetUrl, { 
                  method: 'GET',
                  mode: 'no-cors'
                })
                .then(response => {
                  parent.postMessage({
                    type: 'linkCheck',
                    url: targetUrl,
                    status: response.status || 200,
                    success: true
                  }, '*');
                })
                .catch(getError => {
                  parent.postMessage({
                    type: 'linkCheck',
                    url: targetUrl,
                    status: null,
                    success: false,
                    error: getError.message
                  }, '*');
                });
              });
            })();
          </script>
        </body>
        </html>
      `;
      
      // Add iframe to document
      document.body.appendChild(iframe);
      
      // Set iframe content
      iframe.srcdoc = iframeContent;
    });
  }

  private async tryProxyFetch(url: string, startTime: number): Promise<IFrameLinkCheckResult> {
    const proxies = [
      'https://api.codetabs.com/v1/proxy?quest=',
      'https://api.allorigins.win/raw?url=',
      'https://corsproxy.io/?'
    ];
    
    for (const proxy of proxies) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);
        
        const response = await fetch(`${proxy}${encodeURIComponent(url)}`, {
          signal: controller.signal,
          headers: {
            'User-Agent': 'SEO-Audit-Tool/2.0'
          }
        });
        
        clearTimeout(timeoutId);
        
        return {
          url,
          status: response.status,
          isWorking: response.ok,
          responseTime: Date.now() - startTime,
          method: 'PROXY',
          corsHandled: true
        };
        
      } catch (error) {
        continue;
      }
    }
    
    // All proxies failed
    throw new Error('All proxy attempts failed');
  }
}