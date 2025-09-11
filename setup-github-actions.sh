#!/bin/bash

# GitHub Actions Setup Script for QA Audit Tool
# This script helps you set up the GitHub Actions 24/7 backend solution

echo "🚀 Setting up GitHub Actions 24/7 Backend Solution"
echo "=================================================="

# Check if we're in the right directory
if [ ! -f "run_audit.py" ]; then
    echo "❌ Error: Please run this script from the QA_Audit_Tool directory"
    echo "   Current directory: $(pwd)"
    echo "   Expected files: run_audit.py, package.json"
    exit 1
fi

echo "✅ Found QA_Audit_Tool directory"

# Check if GitHub Actions workflows exist
if [ ! -d ".github/workflows" ]; then
    echo "❌ Error: .github/workflows directory not found"
    echo "   Please ensure the workflow files have been created"
    exit 1
fi

echo "✅ Found .github/workflows directory"

# List the workflow files
echo ""
echo "📋 Available GitHub Actions workflows:"
for workflow in .github/workflows/*.yml; do
    if [ -f "$workflow" ]; then
        echo "   - $(basename "$workflow")"
    fi
done

# Check if backend config exists
if [ ! -f "src/config/backend-config.js" ]; then
    echo "❌ Warning: Backend configuration file not found"
    echo "   Expected: src/config/backend-config.js"
else
    echo "✅ Found backend configuration"
fi

echo ""
echo "🔧 Setup Steps:"
echo "==============="

echo ""
echo "1. Enable GitHub Actions (if not already enabled):"
echo "   - Go to your repository on GitHub"
echo "   - Click 'Actions' tab"
echo "   - Click 'I understand my workflows, go ahead and enable them'"

echo ""
echo "2. Start the backend service:"
echo "   Option A - Manual start:"
echo "     - Go to Actions tab → 'Backend Service - Continuous Operation'"
echo "     - Click 'Run workflow' → 'Run workflow'"
echo ""
echo "   Option B - Wait for automatic start:"
echo "     - Service will start automatically based on schedule"
echo "     - Monitor will check every 10 minutes and start if needed"

echo ""
echo "3. Monitor the service:"
echo "   - Go to Actions tab to see running workflows"
echo "   - Check workflow logs for service status"
echo "   - Download artifacts for detailed logs"

echo ""
echo "4. Test the frontend:"
echo "   - Visit your GitHub Pages URL"
echo "   - Check for 'Backend Connected' status"
echo "   - Try running a QA audit to verify functionality"

echo ""
echo "📊 Expected Resource Usage:"
echo "=========================="
echo "   - GitHub Actions minutes: ~4,320/month for 24/7 operation"
echo "   - Free tier limit: 2,000 minutes/month"
echo "   - Pro tier limit: 3,000 minutes/month"
echo "   - Consider GitHub Pro if you need 24/7 operation"

echo ""
echo "🔍 Troubleshooting:"
echo "=================="
echo "   - If workflows don't start: Check Actions are enabled"
echo "   - If service crashes: Check workflow logs for Python errors"
echo "   - If frontend can't connect: Verify workflows are running"
echo "   - For detailed help: See GITHUB_ACTIONS_SOLUTION.md"

echo ""
echo "📚 Documentation:"
echo "================="
echo "   - Complete guide: GITHUB_ACTIONS_SOLUTION.md"
echo "   - Codespace setup: CODESPACES_SETUP.md (preserved)"
echo "   - Always-on solutions: ALWAYS_ON_SOLUTION.md"

echo ""
echo "🎯 Next Steps:"
echo "=============="
echo "1. Go to GitHub and enable Actions if needed"
echo "2. Start the backend service (manual or wait for automatic)"
echo "3. Monitor the Actions tab for running workflows"
echo "4. Test your application to verify it's working"
echo "5. Check resource usage in repository Settings → Billing"

echo ""
echo "✅ Setup complete! Your GitHub Actions 24/7 backend solution is ready."
echo ""
echo "💡 Tip: You can use both GitHub Actions and Codespaces simultaneously."
echo "   The frontend will automatically connect to the best available backend."

echo ""
echo "🔗 Quick Links:"
echo "   - Actions tab: https://github.com/$(git config --get remote.origin.url | sed 's/.*github.com[:/]\([^.]*\).*/\1/')/actions"
echo "   - Repository settings: https://github.com/$(git config --get remote.origin.url | sed 's/.*github.com[:/]\([^.]*\).*/\1/')/settings"

echo ""
echo "Happy coding! 🎉"
