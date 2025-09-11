# How to Set Up Codespace on Main Branch

## Step 1: Create New Codespace on Main Branch

### Option A: From GitHub Web Interface

1. Go to your GitHub repository: `https://github.com/[your-username]/QA_Audit_Tool`
2. Make sure you're on the **main** branch (check the branch selector at top-left)
3. Click the green **"Code"** button
4. Select the **"Codespaces"** tab
5. Click **"Create codespace on main"**
6. Wait for the Codespace to initialize (2-3 minutes)

### Option B: From Existing Codespace

If you're already in a Codespace but on wrong branch:

1. Open terminal in your Codespace
2. Switch to main branch:
   ```bash
   git checkout main
   git pull origin main
   ```

## Step 2: Start the Backend Server

Once your Codespace is running on main branch:

1. **Install dependencies**:

   ```bash
   cd QA_Audit_Tool
   pip install -r requirements.txt
   ```

2. **Start the backend server**:

   ```bash
   python run_audit.py
   ```

3. **Make port public**:
   - Look for the "Ports" tab at the bottom of VS Code
   - Find port 8000
   - Right-click and select **"Port Visibility" → "Public"**
   - Copy the public URL (it will look like: `https://[codespace-name]-8000.app.github.dev`)

## Step 3: Update Frontend with New Codespace URL

1. **Get your new Codespace URL**:

   - From the Ports tab, copy the public URL for port 8000
   - It should look like: `https://new-codespace-name-8000.app.github.dev`

2. **Update the frontend code**:

   - Open `QA_Audit_Tool/src/App.tsx`
   - Find the `potentialUrls` array (around line 47)
   - Add your new URL at the top of the list:

   ```typescript
   const potentialUrls = [
     "https://your-new-codespace-name-8000.app.github.dev", // Add this line
     "https://organic-space-fishstick-rqpqvrw99w4f57x4-8000.app.github.dev",
     "https://scaling-space-enigma-w5x4q7g5xvwf5p9x-8000.app.github.dev",
     "https://friendly-space-disco-v7w9x4r6qpgj2k8m-8000.app.github.dev",
     "https://improved-space-journey-p9q2w5r8txnm3k7j-8000.app.github.dev",
   ];
   ```

3. **Commit and deploy the changes**:
   ```bash
   git add .
   git commit -m "Add new Codespace URL for main branch backend"
   git push origin main
   ```

## Step 4: Test the Connection

1. **Wait for deployment** (2-3 minutes for GitHub Pages to update)
2. **Visit your GitHub Pages URL**: `https://[username].github.io/QA_Audit_Tool/`
3. **Check connection status**:
   - You should see a green "Backend Connected" banner
   - If you see red error, check the browser console (F12) for detailed logs

## Step 5: Keep Codespace Alive (Optional)

To prevent your Codespace from auto-stopping:

1. **Create keep-alive script**:

   ```bash
   echo '#!/bin/bash
   while true; do
     echo "Keep-alive ping: $(date)"
     sleep 300  # 5 minutes
   done' > keep-alive.sh
   chmod +x keep-alive.sh
   ```

2. **Run in background**:
   ```bash
   nohup ./keep-alive.sh > keep-alive.log 2>&1 &
   ```

## Troubleshooting

### If Codespace is on Wrong Branch

```bash
# Check current branch
git branch

# Switch to main
git checkout main

# Pull latest changes
git pull origin main

# Restart backend
python run_audit.py
```

### If Port is Not Public

1. Go to Ports tab in VS Code
2. Find port 8000
3. Right-click → "Port Visibility" → "Public"
4. Copy the new public URL
5. Update `potentialUrls` in `App.tsx`

### If Frontend Still Shows Error

1. Check browser console (F12) for detailed logs
2. Verify the Codespace URL is correct
3. Test the backend directly: visit `https://your-codespace-url/api/health`
4. Make sure you committed and pushed the URL changes

## Quick Reference Commands

```bash
# Create and start backend
cd QA_Audit_Tool
pip install -r requirements.txt
python run_audit.py

# Update frontend with new URL
# Edit src/App.tsx → potentialUrls array
git add .
git commit -m "Update Codespace URL"
git push origin main

# Keep alive (optional)
nohup bash -c 'while true; do echo "alive: $(date)"; sleep 300; done' &
```

## Expected Result

After following these steps:

- ✅ Codespace running on main branch
- ✅ Backend server active on port 8000 (public)
- ✅ Frontend automatically detects and connects
- ✅ Green "Backend Connected" status shown
- ✅ QA Audit Tool fully functional

The dynamic detection system will automatically find your new Codespace and connect to it!
