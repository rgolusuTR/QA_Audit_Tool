#!/usr/bin/env python3
"""
Example of batch analysis for multiple URLs
"""

import asyncio
import json
import csv
from datetime import datetime
from seo_audit_tool import SEOAnalyzer
from dataclasses import asdict

async def analyze_multiple_urls(urls):
    """Analyze multiple URLs and save results"""
    
    all_results = []
    
    for i, url in enumerate(urls, 1):
        print(f"\n{'='*60}")
        print(f"Analyzing {i}/{len(urls)}: {url}")
        print(f"{'='*60}")
        
        try:
            analyzer = SEOAnalyzer(url)
            analyzer.link_checker.max_concurrent = 10
            analyzer.link_checker.timeout = 30
            
            results = await analyzer.analyze()
            all_results.append(results)
            
            # Print quick summary
            print(f"✓ Analysis complete for {url}")
            print(f"  Links: {results.statistics['total_links']} total, "
                  f"{results.statistics['broken_links']} broken "
                  f"({results.statistics['success_rate']:.1f}% success rate)")
            
        except Exception as e:
            print(f"✗ Error analyzing {url}: {e}")
            continue
    
    # Save all results
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    
    # Save detailed JSON results
    json_filename = f"batch_analysis_{timestamp}.json"
    with open(json_filename, 'w') as f:
        json.dump([asdict(result) for result in all_results], f, indent=2, default=str)
    
    # Save summary CSV
    csv_filename = f"batch_summary_{timestamp}.csv"
    with open(csv_filename, 'w', newline='') as f:
        writer = csv.writer(f)
        writer.writerow([
            'URL', 'Title', 'Title Length', 'Meta Description Length',
            'H1 Count', 'Word Count', 'Total Links', 'Working Links',
            'Broken Links', 'Success Rate %', 'Load Time (s)', 'Page Size (KB)'
        ])
        
        for result in all_results:
            writer.writerow([
                result.url,
                result.seo_metrics.title,
                result.seo_metrics.title_length,
                result.seo_metrics.meta_description_length,
                len(result.seo_metrics.h1_tags),
                result.seo_metrics.word_count,
                result.statistics['total_links'],
                result.statistics['working_links'],
                result.statistics['broken_links'],
                f"{result.statistics['success_rate']:.1f}",
                f"{result.seo_metrics.load_time:.2f}",
                f"{result.seo_metrics.page_size / 1024:.1f}"
            ])
    
    print(f"\n{'='*60}")
    print(f"BATCH ANALYSIS COMPLETE")
    print(f"{'='*60}")
    print(f"Analyzed {len(all_results)} URLs successfully")
    print(f"Detailed results saved to: {json_filename}")
    print(f"Summary CSV saved to: {csv_filename}")
    
    return all_results

async def main():
    """Main function for batch analysis"""
    
    # List of URLs to analyze
    urls = [
        "https://example.com",
        "https://httpbin.org",
        "https://jsonplaceholder.typicode.com",
        # Add more URLs here
    ]
    
    print(f"Starting batch analysis of {len(urls)} URLs...")
    results = await analyze_multiple_urls(urls)
    
    # Print overall summary
    if results:
        total_links = sum(r.statistics['total_links'] for r in results)
        total_broken = sum(r.statistics['broken_links'] for r in results)
        avg_success_rate = sum(r.statistics['success_rate'] for r in results) / len(results)
        
        print(f"\nOVERALL SUMMARY:")
        print(f"URLs Analyzed: {len(results)}")
        print(f"Total Links Checked: {total_links}")
        print(f"Total Broken Links: {total_broken}")
        print(f"Average Success Rate: {avg_success_rate:.1f}%")

if __name__ == "__main__":
    asyncio.run(main())