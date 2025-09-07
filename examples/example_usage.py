#!/usr/bin/env python3
"""
Example usage of the SEO Audit Tool
"""

import asyncio
import json
from seo_audit_tool import SEOAnalyzer, ResultsDisplayer

async def example_analysis():
    """Example of how to use the SEO analyzer programmatically"""
    
    # Initialize the analyzer
    url = "https://example.com"
    analyzer = SEOAnalyzer(url)
    
    # Configure settings
    analyzer.link_checker.max_concurrent = 15
    analyzer.link_checker.timeout = 30
    
    print(f"Starting analysis of {url}...")
    
    try:
        # Perform the analysis
        results = await analyzer.analyze()
        
        # Display results using the built-in displayer
        displayer = ResultsDisplayer()
        
        # Show SEO metrics
        displayer.display_seo_metrics(results.seo_metrics)
        
        # Show statistics
        displayer.display_statistics(results.statistics)
        
        # Show broken links
        if results.errors_by_category['broken_links']:
            displayer.display_error_category(
                'BROKEN LINKS', 
                results.errors_by_category['broken_links']
            )
        
        # Show 4xx errors
        if results.errors_by_category['4xx_errors']:
            displayer.display_error_category(
                '4XX CLIENT ERRORS', 
                results.errors_by_category['4xx_errors']
            )
        
        # Show working links (first 10)
        displayer.display_working_links(
            results.errors_by_category['working_links'], 
            max_display=10
        )
        
        # Save results to JSON
        with open('example_results.json', 'w') as f:
            # Convert dataclass to dict for JSON serialization
            from dataclasses import asdict
            json.dump(asdict(results), f, indent=2, default=str)
        
        print("\nResults saved to example_results.json")
        
        # Print summary
        print(f"\nSUMMARY:")
        print(f"Total Links: {results.statistics['total_links']}")
        print(f"Working Links: {results.statistics['working_links']}")
        print(f"Broken Links: {results.statistics['broken_links']}")
        print(f"Success Rate: {results.statistics['success_rate']:.1f}%")
        
    except Exception as e:
        print(f"Error during analysis: {e}")

if __name__ == "__main__":
    asyncio.run(example_analysis())