# Dynamic Codespace Detection & Auto-Reconnection

## Overview

The QA Audit Tool now features **dynamic Codespace detection** that automatically handles GitHub Codespace auto-stopping behavior. This ensures the tool remains functional even when Codespaces automatically stop after periods of inactivity.

## Problem Solved

**Issue**: GitHub Codespaces automatically stop after 30 minutes of inactivity, breaking the connection between the GitHub Pages frontend and the backend API.

**Solution**: Dynamic detection system that automatically finds and connects to active Codespaces, with multiple backup URLs for redundancy.

## How It Works

### 1. Automatic Detection on Load

When the frontend loads, it automatically:

- Detects the current environment (GitHub Pages, Codespace, or localhost)
- Tests multiple potential Codespace URLs to find an active backend
- Displays real-time connection status to the user
- Gracefully handles connection failures with helpful error messages

### 2. Multiple Backup Codespaces

The system tests multiple Codespace URLs in sequence:

```typescript
const potentialUrls = [
  "https://organic-space-fishstick-rqpqvrw99w4f57x4-8000.app.github.dev",
  "https://scaling-space-enigma-w5x4q7g5xvwf5p9x-8000.app.github.dev",
  "https://friendly-space-disco-v7w9x4r6qpgj2k8m-8000.app.github.dev",
  "https://improved-space-journey-p9q2w5r8txnm3k7j-8000.app.github.dev",
];
```

### 3. Health Check System

Each potential backend URL is tested with:

- `/api/health` endpoint check
- 5-second timeout using AbortController
- Proper error handling and logging
- Automatic fallback to next URL if one fails

### 4. Real-Time Status Display

Users see clear status indicators:

- 🔄 **Initializing**: "Detecting backend server..."
- ✅ **Connected**: "Connected to: [codespace-url]"
- ❌ **Error**: "No active Codespace backend found"

## Usage Instructions

### For Users

1. **Access the tool**: Visit the GitHub Pages URL
2. **Wait for connection**: The tool automatically detects available backends
3. **Check status**: Green banner = ready to use, Red banner = needs setup
4. **If no backend found**: Start a new Codespace or restart an existing one

### For Developers

1. **Add new Codespace URLs**: Update the `potentialUrls` array in `App.tsx`
2. **Modify timeout**: Adjust the 5000ms timeout in `fetchWithTimeout`
3. **Customize health endpoint**: Change `/api/health` to your preferred endpoint

## Technical Implementation

### Key Components

#### 1. `fetchWithTimeout` Function

```typescript
const fetchWithTimeout = async (
  url: string,
  options: RequestInit = {},
  timeoutMs: number = 5000
) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
};
```

#### 2. `getApiBaseUrl` Function

- Detects environment (Codespace vs GitHub Pages vs localhost)
- Tests multiple URLs sequentially
- Returns first working backend URL or null

#### 3. `useEffect` Hook

- Runs on component mount
- Initializes API URL detection
- Updates connection status state
- Handles errors gracefully

### Error Handling

- **Connection timeout**: 5-second limit per URL test
- **Network errors**: Automatic fallback to next URL
- **No backends found**: Clear error message with setup instructions
- **TypeScript safety**: Proper error typing and handling

## Benefits

### 1. **Always-On Functionality**

- Tool works even when original Codespace stops
- Automatic detection of any active Codespace
- No manual URL updates required

### 2. **User-Friendly Experience**

- Clear status indicators
- Helpful error messages
- Automatic initialization
- No technical knowledge required

### 3. **Developer-Friendly**

- Easy to add new Codespace URLs
- Comprehensive logging for debugging
- Modular, maintainable code
- TypeScript safety

### 4. **Resilient Architecture**

- Multiple backup options
- Graceful failure handling
- Timeout protection
- Proper resource cleanup

## Deployment

The system is automatically deployed via GitHub Actions:

1. Code changes trigger build process
2. Static files deployed to GitHub Pages
3. Dynamic detection works immediately
4. No server-side configuration needed

## Monitoring

Check browser console for detailed logs:

- `🔄 Initializing API URL detection...`
- `🔍 Testing Codespace: [url]`
- `✅ Found active Codespace: [url]`
- `❌ Codespace not active: [url]`

## Future Enhancements

1. **Periodic Re-detection**: Automatically retry connection every few minutes
2. **Codespace Management**: Integration with GitHub API to start/stop Codespaces
3. **Load Balancing**: Distribute requests across multiple active Codespaces
4. **Caching**: Remember last working Codespace URL
5. **Notifications**: Alert users when backend connection is restored

## Troubleshooting

### Common Issues

**"No active Codespace backend found"**

- Start a new Codespace from the repository
- Ensure the backend server is running on port 8000
- Check that the port is set to public visibility

**"Failed to detect backend server"**

- Check internet connection
- Refresh the page
- Try opening in incognito mode

**Connection works but analysis fails**

- Verify backend server is fully started
- Check Codespace logs for errors
- Ensure all dependencies are installed

### Debug Steps

1. Open browser developer tools
2. Check console for detailed logs
3. Verify network requests in Network tab
4. Test backend URL directly in browser
5. Check Codespace status in GitHub

## Conclusion

The dynamic Codespace detection system solves the auto-stopping issue by automatically finding and connecting to active backends. This ensures the QA Audit Tool remains functional and user-friendly, even with GitHub Codespace's automatic sleep behavior.

The system is designed to be robust, user-friendly, and maintainable, providing a seamless experience for both end users and developers.
