#!/usr/bin/env python3
"""
Professional SEO Audit Tool with Comprehensive Link Validation
Uses popular Python libraries for accurate broken link detection
"""

import asyncio
import aiohttp
import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse
import time
import json
from typing import Dict, List, Tuple, Optional, Set
from dataclasses import dataclass, asdict
from collections import defaultdict
import validators
from fake_useragent import UserAgent
from rich.console import Console
from rich.table import Table
from rich.progress import Progress, TaskID
from rich.panel import Panel
from rich.text import Text
import click

console = Console()
ua = UserAgent()

@dataclass
class LinkResult:
    """Data class for link validation results"""
    url: str
    status_code: Optional[int]
    is_working: bool
    response_time: float
    error_message: str
    anchor_text: str
    link_type: str  # 'internal' or 'external'
    redirect_chain: List[str]
    final_url: str
    content_type: str
    method_used: str  # 'HEAD', 'GET', 'ASYNC'

@dataclass
class SEOMetrics:
    """Data class for SEO metrics"""
    title: str
    title_length: int
    meta_description: str
    meta_description_length: int
    h1_tags: List[str]
    h2_tags: List[str]
    h3_tags: List[str]
    canonical_url: str
    meta_robots: str
    lang: str
    images_count: int
    images_without_alt: int
    word_count: int
    page_size: int
    load_time: float

@dataclass
class AuditResults:
    """Complete audit results"""
    url: str
    timestamp: str
    seo_metrics: SEOMetrics
    link_results: List[LinkResult]
    statistics: Dict
    errors_by_category: Dict[str, List[LinkResult]]

class ProfessionalLinkChecker:
    """Professional broken link checker using popular Python libraries"""
    
    def __init__(self, base_url: str, max_concurrent: int = 10, timeout: int = 30):
        self.base_url = base_url
        self.base_domain = urlparse(base_url).netloc
        self.max_concurrent = max_concurrent
        self.timeout = timeout
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': ua.random,
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate',
            'DNT': '1',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
        })
        
    def extract_links(self, html_content: str) -> List[Tuple[str, str]]:
        """Extract all links from HTML content"""
        soup = BeautifulSoup(html_content, 'lxml')
        links = []
        
        for link in soup.find_all('a', href=True):
            href = link.get('href', '').strip()
            if not href or href.startswith(('#', 'javascript:', 'mailto:', 'tel:')):
                continue
                
            # Convert relative URLs to absolute
            absolute_url = urljoin(self.base_url, href)
            
            # Validate URL
            if not validators.url(absolute_url):
                continue
                
            # Get anchor text
            anchor_text = link.get_text(strip=True) or link.get('title', '') or href
            anchor_text = anchor_text[:100] + '...' if len(anchor_text) > 100 else anchor_text
            
            links.append((absolute_url, anchor_text))
        
        # Remove duplicates while preserving order
        seen = set()
        unique_links = []
        for url, anchor in links:
            if url not in seen:
                seen.add(url)
                unique_links.append((url, anchor))
        
        return unique_links
    
    def check_single_link_sync(self, url: str, anchor_text: str) -> LinkResult:
        """Check a single link synchronously with multiple methods"""
        start_time = time.time()
        parsed_url = urlparse(url)
        is_internal = parsed_url.netloc == self.base_domain
        link_type = 'internal' if is_internal else 'external'
        
        # Try HEAD request first (faster)
        try:
            response = self.session.head(
                url, 
                timeout=self.timeout, 
                allow_redirects=True,
                verify=False
            )
            
            response_time = time.time() - start_time
            redirect_chain = [resp.url for resp in response.history] + [response.url]
            
            return LinkResult(
                url=url,
                status_code=response.status_code,
                is_working=200 <= response.status_code < 400,
                response_time=response_time,
                error_message="",
                anchor_text=anchor_text,
                link_type=link_type,
                redirect_chain=redirect_chain if len(redirect_chain) > 1 else [],
                final_url=response.url,
                content_type=response.headers.get('content-type', ''),
                method_used='HEAD'
            )
            
        except requests.exceptions.RequestException as e:
            # If HEAD fails, try GET request
            try:
                response = self.session.get(
                    url, 
                    timeout=self.timeout, 
                    allow_redirects=True,
                    verify=False
                )
                
                response_time = time.time() - start_time
                redirect_chain = [resp.url for resp in response.history] + [response.url]
                
                return LinkResult(
                    url=url,
                    status_code=response.status_code,
                    is_working=200 <= response.status_code < 400,
                    response_time=response_time,
                    error_message="",
                    anchor_text=anchor_text,
                    link_type=link_type,
                    redirect_chain=redirect_chain if len(redirect_chain) > 1 else [],
                    final_url=response.url,
                    content_type=response.headers.get('content-type', ''),
                    method_used='GET'
                )
                
            except requests.exceptions.RequestException as get_error:
                response_time = time.time() - start_time
                
                # Extract status code from error if available
                status_code = None
                if hasattr(get_error, 'response') and get_error.response is not None:
                    status_code = get_error.response.status_code
                
                return LinkResult(
                    url=url,
                    status_code=status_code,
                    is_working=False,
                    response_time=response_time,
                    error_message=str(get_error),
                    anchor_text=anchor_text,
                    link_type=link_type,
                    redirect_chain=[],
                    final_url=url,
                    content_type="",
                    method_used='GET'
                )
    
    async def check_single_link_async(self, session: aiohttp.ClientSession, url: str, anchor_text: str) -> LinkResult:
        """Check a single link asynchronously"""
        start_time = time.time()
        parsed_url = urlparse(url)
        is_internal = parsed_url.netloc == self.base_domain
        link_type = 'internal' if is_internal else 'external'
        
        try:
            async with session.head(url, timeout=aiohttp.ClientTimeout(total=self.timeout)) as response:
                response_time = time.time() - start_time
                
                return LinkResult(
                    url=url,
                    status_code=response.status,
                    is_working=200 <= response.status < 400,
                    response_time=response_time,
                    error_message="",
                    anchor_text=anchor_text,
                    link_type=link_type,
                    redirect_chain=[],
                    final_url=str(response.url),
                    content_type=response.headers.get('content-type', ''),
                    method_used='ASYNC_HEAD'
                )
                
        except Exception as e:
            try:
                async with session.get(url, timeout=aiohttp.ClientTimeout(total=self.timeout)) as response:
                    response_time = time.time() - start_time
                    
                    return LinkResult(
                        url=url,
                        status_code=response.status,
                        is_working=200 <= response.status < 400,
                        response_time=response_time,
                        error_message="",
                        anchor_text=anchor_text,
                        link_type=link_type,
                        redirect_chain=[],
                        final_url=str(response.url),
                        content_type=response.headers.get('content-type', ''),
                        method_used='ASYNC_GET'
                    )
                    
            except Exception as get_error:
                response_time = time.time() - start_time
                
                return LinkResult(
                    url=url,
                    status_code=None,
                    is_working=False,
                    response_time=response_time,
                    error_message=str(get_error),
                    anchor_text=anchor_text,
                    link_type=link_type,
                    redirect_chain=[],
                    final_url=url,
                    content_type="",
                    method_used='ASYNC_GET'
                )
    
    async def check_links_async(self, links: List[Tuple[str, str]]) -> List[LinkResult]:
        """Check multiple links asynchronously"""
        connector = aiohttp.TCPConnector(limit=self.max_concurrent, verify_ssl=False)
        timeout = aiohttp.ClientTimeout(total=self.timeout)
        
        async with aiohttp.ClientSession(
            connector=connector,
            timeout=timeout,
            headers={
                'User-Agent': ua.random,
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            }
        ) as session:
            
            semaphore = asyncio.Semaphore(self.max_concurrent)
            
            async def check_with_semaphore(url: str, anchor: str):
                async with semaphore:
                    return await self.check_single_link_async(session, url, anchor)
            
            tasks = [check_with_semaphore(url, anchor) for url, anchor in links]
            results = await asyncio.gather(*tasks, return_exceptions=True)
            
            # Filter out exceptions and return valid results
            valid_results = []
            for result in results:
                if isinstance(result, LinkResult):
                    valid_results.append(result)
                else:
                    console.print(f"[red]Error checking link: {result}[/red]")
            
            return valid_results

class SEOAnalyzer:
    """Comprehensive SEO analyzer"""
    
    def __init__(self, url: str):
        self.url = url
        self.link_checker = ProfessionalLinkChecker(url)
        
    def fetch_page_content(self) -> Tuple[str, float]:
        """Fetch the main page content"""
        start_time = time.time()
        
        try:
            response = requests.get(
                self.url,
                headers={'User-Agent': ua.random},
                timeout=30,
                verify=False
            )
            response.raise_for_status()
            load_time = time.time() - start_time
            return response.text, load_time
            
        except requests.exceptions.RequestException as e:
            console.print(f"[red]Error fetching page: {e}[/red]")
            raise
    
    def extract_seo_metrics(self, html_content: str, load_time: float) -> SEOMetrics:
        """Extract SEO metrics from HTML content"""
        soup = BeautifulSoup(html_content, 'lxml')
        
        # Title
        title_tag = soup.find('title')
        title = title_tag.get_text(strip=True) if title_tag else ""
        
        # Meta description
        meta_desc = soup.find('meta', attrs={'name': 'description'})
        meta_description = meta_desc.get('content', '') if meta_desc else ""
        
        # Headings
        h1_tags = [h.get_text(strip=True) for h in soup.find_all('h1')]
        h2_tags = [h.get_text(strip=True) for h in soup.find_all('h2')]
        h3_tags = [h.get_text(strip=True) for h in soup.find_all('h3')]
        
        # Canonical URL
        canonical = soup.find('link', attrs={'rel': 'canonical'})
        canonical_url = canonical.get('href', '') if canonical else ""
        
        # Meta robots
        meta_robots = soup.find('meta', attrs={'name': 'robots'})
        robots_content = meta_robots.get('content', '') if meta_robots else ""
        
        # Language
        html_tag = soup.find('html')
        lang = html_tag.get('lang', 'en') if html_tag else 'en'
        
        # Images
        images = soup.find_all('img')
        images_count = len(images)
        images_without_alt = len([img for img in images if not img.get('alt')])
        
        # Word count
        text_content = soup.get_text()
        word_count = len(text_content.split())
        
        # Page size
        page_size = len(html_content)
        
        return SEOMetrics(
            title=title,
            title_length=len(title),
            meta_description=meta_description,
            meta_description_length=len(meta_description),
            h1_tags=h1_tags,
            h2_tags=h2_tags,
            h3_tags=h3_tags,
            canonical_url=canonical_url,
            meta_robots=robots_content,
            lang=lang,
            images_count=images_count,
            images_without_alt=images_without_alt,
            word_count=word_count,
            page_size=page_size,
            load_time=load_time
        )
    
    async def analyze(self) -> AuditResults:
        """Perform complete SEO analysis"""
        console.print(f"[blue]Starting SEO analysis for: {self.url}[/blue]")
        
        # Fetch page content
        with console.status("[bold green]Fetching page content..."):
            html_content, load_time = self.fetch_page_content()
        
        # Extract SEO metrics
        with console.status("[bold green]Extracting SEO metrics..."):
            seo_metrics = self.extract_seo_metrics(html_content, load_time)
        
        # Extract links
        with console.status("[bold green]Extracting links..."):
            links = self.link_checker.extract_links(html_content)
        
        console.print(f"[green]Found {len(links)} links to check[/green]")
        
        # Check links asynchronously
        with console.status("[bold green]Checking links..."):
            link_results = await self.link_checker.check_links_async(links)
        
        # Calculate statistics
        statistics = self.calculate_statistics(link_results)
        
        # Categorize errors
        errors_by_category = self.categorize_errors(link_results)
        
        return AuditResults(
            url=self.url,
            timestamp=time.strftime('%Y-%m-%d %H:%M:%S'),
            seo_metrics=seo_metrics,
            link_results=link_results,
            statistics=statistics,
            errors_by_category=errors_by_category
        )
    
    def calculate_statistics(self, link_results: List[LinkResult]) -> Dict:
        """Calculate comprehensive statistics"""
        total_links = len(link_results)
        working_links = len([r for r in link_results if r.is_working])
        broken_links = total_links - working_links
        internal_links = len([r for r in link_results if r.link_type == 'internal'])
        external_links = len([r for r in link_results if r.link_type == 'external'])
        
        # Response time statistics
        response_times = [r.response_time for r in link_results if r.response_time > 0]
        avg_response_time = sum(response_times) / len(response_times) if response_times else 0
        
        # Status code distribution
        status_codes = defaultdict(int)
        for result in link_results:
            if result.status_code:
                status_codes[result.status_code] += 1
        
        # Redirects
        redirects = len([r for r in link_results if r.redirect_chain])
        
        return {
            'total_links': total_links,
            'working_links': working_links,
            'broken_links': broken_links,
            'internal_links': internal_links,
            'external_links': external_links,
            'success_rate': (working_links / total_links * 100) if total_links > 0 else 0,
            'avg_response_time': avg_response_time,
            'status_code_distribution': dict(status_codes),
            'redirects': redirects
        }
    
    def categorize_errors(self, link_results: List[LinkResult]) -> Dict[str, List[LinkResult]]:
        """Categorize errors by type"""
        categories = {
            'broken_links': [],
            '4xx_errors': [],
            '5xx_errors': [],
            'network_errors': [],
            'redirects': [],
            'working_links': []
        }
        
        for result in link_results:
            if result.is_working:
                categories['working_links'].append(result)
                if result.redirect_chain:
                    categories['redirects'].append(result)
            else:
                categories['broken_links'].append(result)
                
                if result.status_code:
                    if 400 <= result.status_code < 500:
                        categories['4xx_errors'].append(result)
                    elif 500 <= result.status_code < 600:
                        categories['5xx_errors'].append(result)
                else:
                    categories['network_errors'].append(result)
        
        return categories

class ResultsDisplayer:
    """Display audit results in formatted tables"""
    
    @staticmethod
    def display_seo_metrics(seo_metrics: SEOMetrics):
        """Display SEO metrics"""
        console.print("\n" + "="*80)
        console.print(Panel.fit("[bold blue]SEO METRICS[/bold blue]", style="blue"))
        
        table = Table(show_header=True, header_style="bold magenta")
        table.add_column("Metric", style="cyan")
        table.add_column("Value", style="green")
        table.add_column("Status", style="yellow")
        
        # Title analysis
        title_status = "✓ Good" if 30 <= seo_metrics.title_length <= 60 else "⚠ Needs attention"
        table.add_row("Title", seo_metrics.title[:50] + "..." if len(seo_metrics.title) > 50 else seo_metrics.title, title_status)
        table.add_row("Title Length", str(seo_metrics.title_length), title_status)
        
        # Meta description analysis
        desc_status = "✓ Good" if 120 <= seo_metrics.meta_description_length <= 160 else "⚠ Needs attention"
        table.add_row("Meta Description", seo_metrics.meta_description[:50] + "..." if len(seo_metrics.meta_description) > 50 else seo_metrics.meta_description, desc_status)
        table.add_row("Meta Description Length", str(seo_metrics.meta_description_length), desc_status)
        
        # H1 tags
        h1_status = "✓ Good" if len(seo_metrics.h1_tags) == 1 else "⚠ Should have exactly 1 H1"
        table.add_row("H1 Tags Count", str(len(seo_metrics.h1_tags)), h1_status)
        
        # Other metrics
        table.add_row("H2 Tags Count", str(len(seo_metrics.h2_tags)), "ℹ Info")
        table.add_row("H3 Tags Count", str(len(seo_metrics.h3_tags)), "ℹ Info")
        table.add_row("Language", seo_metrics.lang, "ℹ Info")
        table.add_row("Word Count", str(seo_metrics.word_count), "✓ Good" if seo_metrics.word_count >= 300 else "⚠ Too few words")
        table.add_row("Images Count", str(seo_metrics.images_count), "ℹ Info")
        table.add_row("Images Without Alt", str(seo_metrics.images_without_alt), "✓ Good" if seo_metrics.images_without_alt == 0 else "⚠ Add alt text")
        table.add_row("Page Size", f"{seo_metrics.page_size / 1024:.1f} KB", "ℹ Info")
        table.add_row("Load Time", f"{seo_metrics.load_time:.2f}s", "✓ Good" if seo_metrics.load_time < 3 else "⚠ Slow")
        
        console.print(table)
    
    @staticmethod
    def display_statistics(statistics: Dict):
        """Display link statistics"""
        console.print("\n" + "="*80)
        console.print(Panel.fit("[bold green]LINK STATISTICS[/bold green]", style="green"))
        
        table = Table(show_header=True, header_style="bold magenta")
        table.add_column("Metric", style="cyan")
        table.add_column("Value", style="green")
        
        table.add_row("Total Links", str(statistics['total_links']))
        table.add_row("Working Links", str(statistics['working_links']))
        table.add_row("Broken Links", str(statistics['broken_links']))
        table.add_row("Internal Links", str(statistics['internal_links']))
        table.add_row("External Links", str(statistics['external_links']))
        table.add_row("Success Rate", f"{statistics['success_rate']:.1f}%")
        table.add_row("Average Response Time", f"{statistics['avg_response_time']:.2f}s")
        table.add_row("Redirects Found", str(statistics['redirects']))
        
        console.print(table)
        
        # Status code distribution
        if statistics['status_code_distribution']:
            console.print("\n[bold yellow]Status Code Distribution:[/bold yellow]")
            status_table = Table(show_header=True, header_style="bold magenta")
            status_table.add_column("Status Code", style="cyan")
            status_table.add_column("Count", style="green")
            status_table.add_column("Description", style="yellow")
            
            status_descriptions = {
                200: "OK",
                301: "Moved Permanently",
                302: "Found (Temporary Redirect)",
                404: "Not Found",
                403: "Forbidden",
                500: "Internal Server Error",
                502: "Bad Gateway",
                503: "Service Unavailable"
            }
            
            for status_code, count in sorted(statistics['status_code_distribution'].items()):
                description = status_descriptions.get(status_code, "Unknown")
                status_table.add_row(str(status_code), str(count), description)
            
            console.print(status_table)
    
    @staticmethod
    def display_error_category(category_name: str, results: List[LinkResult], max_display: int = 20):
        """Display a specific error category"""
        if not results:
            return
            
        console.print(f"\n[bold red]{category_name.upper().replace('_', ' ')} ({len(results)} items)[/bold red]")
        
        table = Table(show_header=True, header_style="bold magenta", max_width=120)
        table.add_column("URL", style="cyan", max_width=50)
        table.add_column("Status", style="red")
        table.add_column("Error", style="yellow", max_width=30)
        table.add_column("Anchor Text", style="green", max_width=25)
        table.add_column("Type", style="blue")
        table.add_column("Method", style="magenta")
        
        for result in results[:max_display]:
            url_display = result.url[:47] + "..." if len(result.url) > 50 else result.url
            status_display = str(result.status_code) if result.status_code else "N/A"
            error_display = result.error_message[:27] + "..." if len(result.error_message) > 30 else result.error_message
            anchor_display = result.anchor_text[:22] + "..." if len(result.anchor_text) > 25 else result.anchor_text
            
            table.add_row(
                url_display,
                status_display,
                error_display,
                anchor_display,
                result.link_type,
                result.method_used
            )
        
        console.print(table)
        
        if len(results) > max_display:
            console.print(f"[dim]... and {len(results) - max_display} more items[/dim]")
    
    @staticmethod
    def display_working_links(results: List[LinkResult], max_display: int = 10):
        """Display working links"""
        if not results:
            return
            
        console.print(f"\n[bold green]WORKING LINKS ({len(results)} items)[/bold green]")
        
        table = Table(show_header=True, header_style="bold magenta", max_width=120)
        table.add_column("URL", style="cyan", max_width=50)
        table.add_column("Status", style="green")
        table.add_column("Response Time", style="yellow")
        table.add_column("Anchor Text", style="blue", max_width=25)
        table.add_column("Type", style="magenta")
        table.add_column("Method", style="white")
        
        for result in results[:max_display]:
            url_display = result.url[:47] + "..." if len(result.url) > 50 else result.url
            anchor_display = result.anchor_text[:22] + "..." if len(result.anchor_text) > 25 else result.anchor_text
            
            table.add_row(
                url_display,
                str(result.status_code),
                f"{result.response_time:.2f}s",
                anchor_display,
                result.link_type,
                result.method_used
            )
        
        console.print(table)
        
        if len(results) > max_display:
            console.print(f"[dim]... and {len(results) - max_display} more working links[/dim]")

@click.command()
@click.argument('url')
@click.option('--output', '-o', help='Output file for JSON results')
@click.option('--max-concurrent', '-c', default=10, help='Maximum concurrent requests')
@click.option('--timeout', '-t', default=30, help='Request timeout in seconds')
@click.option('--show-working', '-w', is_flag=True, help='Show working links')
@click.option('--max-display', '-m', default=20, help='Maximum items to display per category')
async def main(url: str, output: str, max_concurrent: int, timeout: int, show_working: bool, max_display: int):
    """
    Professional SEO Audit Tool with Comprehensive Link Validation
    
    URL: The website URL to audit
    """
    
    # Validate URL
    if not validators.url(url):
        console.print(f"[red]Error: Invalid URL '{url}'[/red]")
        return
    
    try:
        # Initialize analyzer
        analyzer = SEOAnalyzer(url)
        analyzer.link_checker.max_concurrent = max_concurrent
        analyzer.link_checker.timeout = timeout
        
        # Perform analysis
        results = await analyzer.analyze()
        
        # Display results
        displayer = ResultsDisplayer()
        
        # SEO Metrics
        displayer.display_seo_metrics(results.seo_metrics)
        
        # Statistics
        displayer.display_statistics(results.statistics)
        
        # Error categories
        error_categories = [
            ('broken_links', 'BROKEN LINKS'),
            ('4xx_errors', '4XX CLIENT ERRORS'),
            ('5xx_errors', '5XX SERVER ERRORS'),
            ('network_errors', 'NETWORK ERRORS'),
            ('redirects', 'REDIRECTS')
        ]
        
        for category_key, category_name in error_categories:
            if results.errors_by_category[category_key]:
                displayer.display_error_category(
                    category_name, 
                    results.errors_by_category[category_key], 
                    max_display
                )
        
        # Working links (if requested)
        if show_working:
            displayer.display_working_links(results.errors_by_category['working_links'], max_display)
        
        # Save to file if requested
        if output:
            with open(output, 'w') as f:
                json.dump(asdict(results), f, indent=2, default=str)
            console.print(f"\n[green]Results saved to {output}[/green]")
        
        # Summary
        console.print("\n" + "="*80)
        console.print(Panel.fit(
            f"[bold green]AUDIT COMPLETE[/bold green]\n"
            f"Total Links: {results.statistics['total_links']}\n"
            f"Working: {results.statistics['working_links']} "
            f"({results.statistics['success_rate']:.1f}%)\n"
            f"Broken: {results.statistics['broken_links']}\n"
            f"Average Response Time: {results.statistics['avg_response_time']:.2f}s",
            style="green"
        ))
        
    except Exception as e:
        console.print(f"[red]Error during analysis: {e}[/red]")
        raise

if __name__ == "__main__":
    asyncio.run(main())