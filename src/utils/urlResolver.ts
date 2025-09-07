export class URLResolver {
  private baseUrl: string;
  private basePath: string;

  constructor(pageUrl: string, htmlContent?: string) {
    const url = new URL(pageUrl);
    this.baseUrl = `${url.protocol}//${url.host}`;
    this.basePath = url.pathname.endsWith('/') ? url.pathname : url.pathname.replace(/\/[^\/]*$/, '/');
    
    // Check for <base> tag in HTML
    if (htmlContent) {
      const baseMatch = htmlContent.match(/<base\s+href\s*=\s*["']([^"']+)["']/i);
      if (baseMatch) {
        try {
          const baseHref = baseMatch[1];
          if (baseHref.startsWith('http')) {
            const baseUrl = new URL(baseHref);
            this.baseUrl = `${baseUrl.protocol}//${baseUrl.host}`;
            this.basePath = baseUrl.pathname.endsWith('/') ? baseUrl.pathname : baseUrl.pathname + '/';
          } else if (baseHref.startsWith('/')) {
            this.basePath = baseHref.endsWith('/') ? baseHref : baseHref + '/';
          }
        } catch (e) {
          console.warn('Invalid base href found:', baseMatch[1]);
        }
      }
    }
  }

  resolveUrl(href: string): string {
    if (!href || href.trim() === '') return '';
    
    href = href.trim();
    
    // Skip non-HTTP protocols
    if (href.startsWith('javascript:') || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('ftp:')) {
      return '';
    }
    
    // Already absolute URL
    if (href.startsWith('http://') || href.startsWith('https://')) {
      return href;
    }
    
    // Protocol-relative URL
    if (href.startsWith('//')) {
      return `https:${href}`;
    }
    
    // Fragment-only URL
    if (href.startsWith('#')) {
      return `${this.baseUrl}${this.basePath}${href}`;
    }
    
    // Query-only URL
    if (href.startsWith('?')) {
      return `${this.baseUrl}${this.basePath}${href}`;
    }
    
    // Root-relative URL
    if (href.startsWith('/')) {
      return `${this.baseUrl}${href}`;
    }
    
    // Current directory relative
    if (href.startsWith('./')) {
      return `${this.baseUrl}${this.basePath}${href.substring(2)}`;
    }
    
    // Parent directory relative
    if (href.startsWith('../')) {
      let path = this.basePath;
      let remainingHref = href;
      
      while (remainingHref.startsWith('../')) {
        path = path.replace(/\/[^\/]*\/$/, '/');
        remainingHref = remainingHref.substring(3);
      }
      
      return `${this.baseUrl}${path}${remainingHref}`;
    }
    
    // Relative URL (no prefix)
    return `${this.baseUrl}${this.basePath}${href}`;
  }

  getBaseUrl(): string {
    return this.baseUrl;
  }

  getBasePath(): string {
    return this.basePath;
  }
}