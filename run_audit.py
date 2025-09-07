#!/usr/bin/env python3
"""
Quick runner script for the QA Audit Tool
"""

import asyncio
import sys
from qa_audit_tool import main

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python run_audit.py <URL> [options]")
        print("Example: python run_audit.py https://example.com --show-working")
        sys.exit(1)
    
    # Run the main function with command line arguments
    asyncio.run(main())
