# GitHub Codespaces Setup Guide

This guide explains how to use GitHub Codespaces to run the QA Audit Tool with both frontend and backend accessible to all users.

## Quick Start with Codespaces

1. **Open in Codespaces**

   - Go to the GitHub repository: https://github.com/rgolusuTR/QA_Audit_Tool
   - Click the green "Code" button
   - Select "Codespaces" tab
   - Click "Create codespace on master"

2. **Automatic Setup**

   - The Codespace will automatically:
     - Install Python 3.11 and Node.js 18
     - Install all Python dependencies from `backend/requirements.txt`
     - Install all Node.js dependencies from `package.json`
     - Start the Python backend server on port 8000
     - Configure port forwarding with public access

3. **Access the Application**
   - **Frontend**: The GitHub Pages deployment at https://rgolusutr.github.io/QA_Audit_Tool/
   - **Backend**: Automatically accessible via the Codespace's public port forwarding
   - The frontend will automatically detect and connect to the Codespace backend

## How It Works

### Automatic Backend Detection

The frontend automatically detects the environment and connects to the appropriate backend:

- **Local Development**: `http://localhost:8000`
- **GitHub Codespaces**: `https://{codespace-name}-8000.app.github.dev`
- **GitHub Pages**: Uses environment variable or shows setup instructions

### Port Configuration

- **Port 8000**: Python FastAPI backend (public visibility)
- **Port 5173**: Vite development server (private visibility)

### Automatic Startup

The `.devcontainer/start-backend.sh` script automatically:

- Navigates to the backend directory
- Starts the Python server with `python main.py`
- Runs in the background
- Provides status updates

## Manual Setup (if needed)

If the automatic setup doesn't work, you can manually start the services:

### Backend Server

```bash
cd backend
pip install -r requirements.txt
python main.py
```

### Frontend Development Server

```bash
npm install
npm run dev
```

## Configuration Files

### `.devcontainer/devcontainer.json`

- Configures Python 3.11 and Node.js 18 environment
- Sets up automatic port forwarding
- Installs VS Code extensions for development
- Runs post-creation and post-start commands

### `.devcontainer/start-backend.sh`

- Bash script for automatic backend startup
- Handles background process management
- Provides status monitoring

## Troubleshooting

### Backend Not Starting

1. Check the terminal for error messages
2. Manually run: `cd backend && python main.py`
3. Ensure all dependencies are installed: `pip install -r backend/requirements.txt`

### Port Access Issues

1. Check that port 8000 is forwarded and set to public
2. Go to Ports tab in VS Code and verify visibility settings
3. Restart the Codespace if needed

### Frontend Connection Errors

1. Check browser console for API URL being used
2. Verify the backend is running and accessible
3. Check that the Codespace URL is correctly formatted

## Benefits of Codespaces Setup

1. **No Local Setup Required**: Users don't need to install Python, Node.js, or dependencies
2. **Public Backend Access**: The backend is accessible to all users via public URL
3. **Automatic Configuration**: Everything starts automatically when the Codespace opens
4. **Consistent Environment**: Same setup for all developers
5. **GitHub Integration**: Seamless integration with GitHub workflow

## Usage for End Users

End users can now:

1. Access the frontend at https://rgolusutr.github.io/QA_Audit_Tool/
2. Use the full QA audit functionality without any local setup
3. The backend runs automatically in the Codespace with public access
4. All features work exactly as if running locally

This setup provides a complete cloud-based solution for the QA Audit Tool, making it accessible to all users without requiring any local installation or configuration.
