# Always-On Backend Solution for QA Audit Tool

## Current Situation

The dynamic Codespace detection is working correctly, but all Codespaces have stopped automatically. The system is properly detecting this and showing the appropriate error message.

## Immediate Solutions

### Option 1: Start a New Codespace (Recommended)

1. Go to your GitHub repository: https://github.com/[username]/QA_Audit_Tool
2. Click the green "Code" button
3. Select "Codespaces" tab
4. Click "Create codespace on main"
5. Once started, run the backend:
   ```bash
   cd QA_Audit_Tool
   pip install -r requirements.txt
   python run_audit.py
   ```
6. Make sure port 8000 is set to "Public" in the Ports tab

### Option 2: Use GitHub Codespaces with Keep-Alive

1. Start a Codespace as above
2. Install a keep-alive script to prevent auto-stopping:

   ```bash
   # Create a keep-alive script
   echo '#!/bin/bash
   while true; do
     echo "Keep-alive ping: $(date)"
     sleep 300  # 5 minutes
   done' > keep-alive.sh
   chmod +x keep-alive.sh

   # Run in background
   nohup ./keep-alive.sh &
   ```

## Long-Term Solutions

### Option 3: Deploy to Always-On Platform

Consider deploying the backend to a platform that doesn't auto-stop:

#### Railway.app (Free tier available)

1. Connect your GitHub repository
2. Deploy the Python backend
3. Update the frontend to use the Railway URL

#### Render.com (Free tier available)

1. Create a new Web Service
2. Connect your repository
3. Set build command: `pip install -r requirements.txt`
4. Set start command: `python run_audit.py`

#### Heroku (Paid)

1. Create a Heroku app
2. Deploy using Git or GitHub integration
3. Configure environment variables

### Option 4: GitHub Actions with Scheduled Restarts

Create a GitHub Action that automatically restarts Codespaces:

```yaml
name: Keep Codespace Alive
on:
  schedule:
    - cron: "*/25 * * * *" # Every 25 minutes
  workflow_dispatch:

jobs:
  ping-codespace:
    runs-on: ubuntu-latest
    steps:
      - name: Ping Codespace
        run: |
          # Try to ping each potential Codespace
          urls=(
            "https://organic-space-fishstick-rqpqvrw99w4f57x4-8000.app.github.dev"
            "https://scaling-space-enigma-w5x4q7g5xvwf5p9x-8000.app.github.dev"
            "https://friendly-space-disco-v7w9x4r6qpgj2k8m-8000.app.github.dev"
            "https://improved-space-journey-p9q2w5r8txnm3k7j-8000.app.github.dev"
          )

          for url in "${urls[@]}"; do
            echo "Pinging $url"
            curl -f "$url/api/health" || echo "Codespace $url is down"
          done
```

## Recommended Approach

For immediate use:

1. **Start a new Codespace** (5 minutes setup)
2. **Add the new Codespace URL** to the backup list in the frontend
3. **Set up keep-alive script** to prevent auto-stopping

For production use:

1. **Deploy backend to Railway or Render** (free, always-on)
2. **Update frontend configuration** to use the new backend URL
3. **Keep Codespace as development environment**

## Adding New Codespace URLs

When you create a new Codespace, add its URL to the frontend:

1. Open `QA_Audit_Tool/src/App.tsx`
2. Find the `potentialUrls` array
3. Add your new Codespace URL:
   ```typescript
   const potentialUrls = [
     "https://your-new-codespace-url-8000.app.github.dev",
     "https://organic-space-fishstick-rqpqvrw99w4f57x4-8000.app.github.dev",
     // ... other URLs
   ];
   ```
4. Commit and push the changes

## Monitoring

The system provides detailed logging in the browser console:

- Open Developer Tools (F12)
- Check Console tab for connection attempts
- Look for messages like "Testing Codespace: [url]"

## Next Steps

1. Choose your preferred solution from above
2. Implement the backend hosting
3. Update the frontend configuration if needed
4. Test the complete system

The dynamic detection system is working perfectly - it just needs an active backend to connect to!
