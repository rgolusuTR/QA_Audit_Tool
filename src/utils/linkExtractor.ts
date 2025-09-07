import { URLResolver } from './urlResolver';

export interface ExtractedLink {
  originalHref: string;
  resolvedUrl: string;
  anchorText: string;
  element: string;
  isInternal: boolean;
  isExternal: boolean;
  linkType: 'navigation' | 'content' | 'footer' | 'header' | 'sidebar' | 'other';
  isValid: boolean;
}

export class LinkExtractor {
  private urlResolver: URLResolver;
  private document: Document;
  private baseHostname: string;

  constructor(pageUrl: string, htmlContent: string, document: Document) {
    this.urlResolver = new URLResolver(pageUrl, htmlContent);
    this.document = document;
    this.baseHostname = new URL(pageUrl).hostname;
  }

  extractAllLinks(): ExtractedLink[] {
    const links: ExtractedLink[] = [];
    const anchorElements = this.document.querySelectorAll('a[href]');
    
    console.log(`Found ${anchorElements.length} anchor elements`);
    
    anchorElements.forEach((element, index) => {
      const href = element.getAttribute('href');
      if (!href || href.trim() === '') return;

      // Skip certain types of links
      if (this.shouldSkipLink(href)) {
        console.log(`Skipping link: ${href}`);
        return;
      }

      const resolvedUrl = this.urlResolver.resolveUrl(href);
      if (!resolvedUrl || !this.isValidHttpUrl(resolvedUrl)) {
        console.log(`Invalid resolved URL: ${href} -> ${resolvedUrl}`);
        return;
      }

      const anchorText = this.getAnchorText(element);
      const linkType = this.determineLinkType(element);
      
      let isInternal = false;
      let isExternal = false;
      
      try {
        const url = new URL(resolvedUrl);
        isInternal = url.hostname === this.baseHostname || url.hostname === `www.${this.baseHostname}` || this.baseHostname === `www.${url.hostname}`;
        isExternal = !isInternal;
      } catch (e) {
        console.warn(`Failed to parse URL: ${resolvedUrl}`);
        return;
      }

      const extractedLink: ExtractedLink = {
        originalHref: href,
        resolvedUrl,
        anchorText,
        element: element.outerHTML,
        isInternal,
        isExternal,
        linkType,
        isValid: true
      };

      links.push(extractedLink);
      
      if (index < 10) { // Log first 10 for debugging
        console.log(`Link ${index + 1}:`, {
          href,
          resolvedUrl,
          anchorText,
          isInternal,
          isExternal
        });
      }
    });

    const deduplicatedLinks = this.deduplicateLinks(links);
    console.log(`Extracted ${deduplicatedLinks.length} unique links (${links.length} total before deduplication)`);
    
    return deduplicatedLinks;
  }

  private shouldSkipLink(href: string): boolean {
    const skipPatterns = [
      /^javascript:/i,
      /^mailto:/i,
      /^tel:/i,
      /^ftp:/i,
      /^data:/i,
      /^#$/,  // Just hash
      /^\s*$/  // Empty or whitespace
    ];
    
    return skipPatterns.some(pattern => pattern.test(href.trim()));
  }

  private isValidHttpUrl(url: string): boolean {
    try {
      const urlObj = new URL(url);
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
    } catch {
      return false;
    }
  }

  private getAnchorText(element: Element): string {
    // Try text content first
    let text = element.textContent?.trim() || '';
    
    // If no text, try title attribute
    if (!text) {
      text = element.getAttribute('title')?.trim() || '';
    }
    
    // If no text, try aria-label
    if (!text) {
      text = element.getAttribute('aria-label')?.trim() || '';
    }
    
    // If no text, try alt text of child images
    if (!text) {
      const img = element.querySelector('img');
      if (img) {
        text = img.getAttribute('alt')?.trim() || '';
      }
    }
    
    // If no text, try to describe the link based on href
    if (!text) {
      const href = element.getAttribute('href') || '';
      if (href.startsWith('#')) {
        text = `Anchor link (${href})`;
      } else if (href.includes('mailto:')) {
        text = `Email link (${href.replace('mailto:', '')})`;
      } else if (href.includes('tel:')) {
        text = `Phone link (${href.replace('tel:', '')})`;
      } else {
        // Extract meaningful part from URL
        try {
          const url = new URL(href.startsWith('http') ? href : `https://${href}`);
          const path = url.pathname.split('/').filter(p => p).pop() || url.hostname;
          text = `Link to ${path}`;
        } catch {
          text = 'Link';
        }
      }
    }
    
    // Clean up the text
    text = text.replace(/\s+/g, ' ').trim();
    
    return text.length > 100 ? text.substring(0, 100) + '...' : text;
  }

  private determineLinkType(element: Element): ExtractedLink['linkType'] {
    // Check parent elements for context
    const parent = element.closest('nav, header, footer, aside, .nav, .navigation, .menu, .header, .footer, .sidebar, [role="navigation"], [role="banner"], [role="contentinfo"]');
    
    if (parent) {
      const tagName = parent.tagName.toLowerCase();
      const className = parent.className.toLowerCase();
      const role = parent.getAttribute('role')?.toLowerCase();
      
      if (tagName === 'nav' || className.includes('nav') || className.includes('menu') || role === 'navigation') {
        return 'navigation';
      }
      if (tagName === 'header' || className.includes('header') || role === 'banner') {
        return 'header';
      }
      if (tagName === 'footer' || className.includes('footer') || role === 'contentinfo') {
        return 'footer';
      }
      if (tagName === 'aside' || className.includes('sidebar')) {
        return 'sidebar';
      }
    }
    
    // Check if it's in main content area
    const mainContent = element.closest('main, article, .content, .main, #content, #main, [role="main"]');
    if (mainContent) {
      return 'content';
    }
    
    return 'other';
  }

  private deduplicateLinks(links: ExtractedLink[]): ExtractedLink[] {
    const seen = new Map<string, ExtractedLink>();
    
    links.forEach(link => {
      const key = link.resolvedUrl.toLowerCase();
      
      if (!seen.has(key)) {
        seen.set(key, link);
      } else {
        // Keep the link with better anchor text (longer and more descriptive)
        const existing = seen.get(key)!;
        if (link.anchorText.length > existing.anchorText.length && 
            !link.anchorText.toLowerCase().includes('link')) {
          seen.set(key, link);
        }
      }
    });
    
    return Array.from(seen.values());
  }

  getStatistics(): {
    total: number;
    internal: number;
    external: number;
    byType: Record<string, number>;
  } {
    const links = this.extractAllLinks();
    
    const stats = {
      total: links.length,
      internal: links.filter(l => l.isInternal).length,
      external: links.filter(l => l.isExternal).length,
      byType: {} as Record<string, number>
    };
    
    links.forEach(link => {
      stats.byType[link.linkType] = (stats.byType[link.linkType] || 0) + 1;
    });
    
    return stats;
  }
}