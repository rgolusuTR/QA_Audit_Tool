export interface SEOData {
  title: string;
  titleLength: number;
  metaDescription: string;
  metaDescriptionLength: number;
  h1Tags: string[];
  h2Tags: string[];
  h3Tags: string[];
  h4Tags: string[];
  h5Tags: string[];
  h6Tags: string[];
  metaKeywords: string;
  canonicalUrl: string;
  metaRobots: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  ogUrl: string;
  twitterCard: string;
  twitterTitle: string;
  twitterDescription: string;
  twitterImage: string;
  structuredData: any[];
  lang: string;
  charset: string;
  viewport: string;
  images: ImageData[];
  wordCount: number;
  textContent: string;
}

export interface ImageData {
  src: string;
  alt: string;
  title: string;
  width?: number;
  height?: number;
  loading?: string;
  element: string;
}

export class SEOExtractor {
  private document: Document;
  private urlResolver: any;

  constructor(document: Document, urlResolver: any) {
    this.document = document;
    this.urlResolver = urlResolver;
  }

  extractSEOData(): SEOData {
    return {
      title: this.extractTitle(),
      titleLength: this.extractTitle().length,
      metaDescription: this.extractMetaDescription(),
      metaDescriptionLength: this.extractMetaDescription().length,
      h1Tags: this.extractHeadings('h1'),
      h2Tags: this.extractHeadings('h2'),
      h3Tags: this.extractHeadings('h3'),
      h4Tags: this.extractHeadings('h4'),
      h5Tags: this.extractHeadings('h5'),
      h6Tags: this.extractHeadings('h6'),
      metaKeywords: this.extractMetaKeywords(),
      canonicalUrl: this.extractCanonicalUrl(),
      metaRobots: this.extractMetaRobots(),
      ogTitle: this.extractOpenGraphData('og:title'),
      ogDescription: this.extractOpenGraphData('og:description'),
      ogImage: this.extractOpenGraphData('og:image'),
      ogUrl: this.extractOpenGraphData('og:url'),
      twitterCard: this.extractTwitterData('twitter:card'),
      twitterTitle: this.extractTwitterData('twitter:title'),
      twitterDescription: this.extractTwitterData('twitter:description'),
      twitterImage: this.extractTwitterData('twitter:image'),
      structuredData: this.extractStructuredData(),
      lang: this.extractLanguage(),
      charset: this.extractCharset(),
      viewport: this.extractViewport(),
      images: this.extractImages(),
      wordCount: this.calculateWordCount(),
      textContent: this.extractTextContent()
    };
  }

  private extractTitle(): string {
    const titleElement = this.document.querySelector('title');
    return titleElement?.textContent?.trim() || '';
  }

  private extractMetaDescription(): string {
    const metaDesc = this.document.querySelector('meta[name="description"]');
    return metaDesc?.getAttribute('content')?.trim() || '';
  }

  private extractHeadings(tag: string): string[] {
    const headings = this.document.querySelectorAll(tag);
    return Array.from(headings)
      .map(h => h.textContent?.trim() || '')
      .filter(text => text.length > 0);
  }

  private extractMetaKeywords(): string {
    const metaKeywords = this.document.querySelector('meta[name="keywords"]');
    return metaKeywords?.getAttribute('content')?.trim() || '';
  }

  private extractCanonicalUrl(): string {
    const canonical = this.document.querySelector('link[rel="canonical"]');
    const href = canonical?.getAttribute('href') || '';
    return href ? this.urlResolver.resolveUrl(href) : '';
  }

  private extractMetaRobots(): string {
    const metaRobots = this.document.querySelector('meta[name="robots"]');
    return metaRobots?.getAttribute('content')?.trim() || '';
  }

  private extractOpenGraphData(property: string): string {
    const ogElement = this.document.querySelector(`meta[property="${property}"]`);
    return ogElement?.getAttribute('content')?.trim() || '';
  }

  private extractTwitterData(name: string): string {
    const twitterElement = this.document.querySelector(`meta[name="${name}"]`);
    return twitterElement?.getAttribute('content')?.trim() || '';
  }

  private extractStructuredData(): any[] {
    const scripts = this.document.querySelectorAll('script[type="application/ld+json"]');
    const structuredData: any[] = [];
    
    scripts.forEach(script => {
      try {
        const data = JSON.parse(script.textContent || '');
        structuredData.push(data);
      } catch (e) {
        // Invalid JSON, skip
      }
    });
    
    return structuredData;
  }

  private extractLanguage(): string {
    const htmlLang = this.document.documentElement.getAttribute('lang');
    if (htmlLang) return htmlLang;
    
    const metaLang = this.document.querySelector('meta[http-equiv="content-language"]');
    return metaLang?.getAttribute('content')?.trim() || 'en';
  }

  private extractCharset(): string {
    const charsetMeta = this.document.querySelector('meta[charset]');
    if (charsetMeta) return charsetMeta.getAttribute('charset') || '';
    
    const httpEquivMeta = this.document.querySelector('meta[http-equiv="content-type"]');
    const content = httpEquivMeta?.getAttribute('content') || '';
    const charsetMatch = content.match(/charset=([^;]+)/i);
    return charsetMatch ? charsetMatch[1] : 'UTF-8';
  }

  private extractViewport(): string {
    const viewport = this.document.querySelector('meta[name="viewport"]');
    return viewport?.getAttribute('content')?.trim() || '';
  }

  private extractImages(): ImageData[] {
    const images = this.document.querySelectorAll('img');
    return Array.from(images).map(img => {
      const src = img.getAttribute('src') || '';
      return {
        src: src ? this.urlResolver.resolveUrl(src) : '',
        alt: img.getAttribute('alt') || '',
        title: img.getAttribute('title') || '',
        width: img.width || undefined,
        height: img.height || undefined,
        loading: img.getAttribute('loading') || undefined,
        element: img.outerHTML
      };
    });
  }

  private calculateWordCount(): number {
    const textContent = this.extractTextContent();
    const words = textContent.match(/\b\w+\b/g);
    return words ? words.length : 0;
  }

  private extractTextContent(): string {
    // Remove script and style elements
    const clone = this.document.cloneNode(true) as Document;
    const scripts = clone.querySelectorAll('script, style, noscript');
    scripts.forEach(el => el.remove());
    
    return clone.body?.textContent?.trim() || '';
  }
}