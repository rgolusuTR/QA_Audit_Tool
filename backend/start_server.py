#!/usr/bin/env python3
"""
Start the SEO Audit Tool backend server
"""

import uvicorn
import sys
import os

# Add the current directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

if __name__ == "__main__":
    print("🚀 Starting Professional QA Audit Tool Backend...")
    print("📊 Using professional broken link checker libraries:")
    print("   • requests - Industry-standard HTTP library")
    print("   • aiohttp - High-performance async HTTP client")
    print("   • beautifulsoup4 - Professional HTML parsing")
    print("   • lxml - Fast XML/HTML parser")
    print("🔗 Advanced link validation with retry mechanisms")
    print("📈 Real-time statistics and comprehensive error reporting")
    print("🌐 Server will be available at: http://localhost:8000")
    print("📖 API documentation at: http://localhost:8000/docs")
    print("🔧 CORS enabled for frontend communication")
    print("\n" + "="*60)
    
    try:
        uvicorn.run(
            "main:app",
            host="0.0.0.0",
            port=8000,
            reload=True,
            log_level="info"
        )
    except KeyboardInterrupt:
        print("\n👋 Server stopped by user")
    except Exception as e:
        print(f"❌ Error starting server: {e}")
        sys.exit(1)