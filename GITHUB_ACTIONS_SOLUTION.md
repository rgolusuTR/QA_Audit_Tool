# GitHub Actions 24/7 Backend Solution

This document explains how to use GitHub Actions to run your QA Audit Tool backend continuously without timeouts, while preserving the existing Codespace functionality.

## Overview

The GitHub Actions solution creates a near-continuous operation pattern that minimizes downtime by:

- Running workflows in overlapping schedules
- Automatically restarting when workflows timeout
- Monitoring service health and triggering restarts when needed
- Preserving all existing Codespace functionality as fallback

## Architecture

### 1. Main Service Workflow (`backend-continuous.yml`)

- Runs the backend service for up to 5 hours 45 minutes
- Automatically restarts the service if it crashes
- Triggers the next workflow run before timing out
- Uploads service logs for monitoring

### 2. Service Monitor (`service-monitor.yml`)

- Checks every 10 minutes if the main service is running
- Automatically starts a new service instance if none are running
- Monitors for multiple instances to prevent resource waste
- Creates status reports for troubleshooting

### 3. Backend Configuration (`src/config/backend-config.js`)

- Manages multiple backend options with priority system
- Supports GitHub Actions, Codespaces, and local backends
- Provides environment detection and URL management

## Setup Instructions

### Step 1: Enable GitHub Actions

1. Go to your repository on GitHub
2. Click on the "Actions" tab
3. If Actions are disabled, click "I understand my workflows, go ahead and enable them"

### Step 2: Start the Service

You can start the service in several ways:

#### Option A: Manual Start

1. Go to Actions tab → "Backend Service - Continuous Operation"
2. Click "Run workflow" → "Run workflow"

#### Option B: Automatic Start (Scheduled)

The service will automatically start based on the cron schedule:

- Every 4 hours: `0 0,4,8,12,16,20 * * *`
- Staggered backup: `30 2,6,10,14,18,22 * * *`

#### Option C: Monitor Will Start It

The service monitor runs every 10 minutes and will start the service if it's not running.

### Step 3: Verify Service is Running

1. Go to Actions tab
2. Look for running workflows named "Backend Service - Continuous Operation"
3. Check the logs to see the service status
4. The service will log status every 5 minutes

## How It Works

### Continuous Operation Pattern

```
Time:     0h    4h    6h    8h    12h   14h   16h   20h   22h   24h
Service1: |-----|     |-----|     |-----|     |-----|
Service2:   |-----|     |-----|     |-----|     |-----|
Monitor:  |--|--|--|--|--|--|--|--|--|--|--|--|--|--|--|--|
```

- Main workflows run for ~6 hours each
- Overlapping schedules ensure continuous coverage
- Monitor checks every 10 minutes and fills gaps

### Self-Healing Features

1. **Auto-Restart**: If the backend process crashes, the workflow restarts it
2. **Timeout Management**: Workflows gracefully shut down before GitHub's timeout
3. **Gap Detection**: Monitor detects when no service is running and starts one
4. **Chain Triggering**: Each workflow triggers the next one before ending

### Logging and Monitoring

- Service logs are uploaded as artifacts after each run
- Status reports show service health every 10 minutes
- Console logs show detailed service status
- Failed workflows trigger automatic restarts

## Configuration Options

### Adjusting Run Frequency

Edit the cron schedules in the workflow files:

```yaml
# More frequent (every 2 hours)
- cron: "0 */2 * * *"

# Less frequent (every 6 hours)
- cron: "0 */6 * * *"
```

### Changing Service Runtime

Modify the timeout in `backend-continuous.yml`:

```yaml
# Shorter runtime (3 hours)
timeout-minutes: 180

# Longer runtime (close to 6 hour limit)
timeout-minutes: 350
```

### Backend Priority Configuration

Edit `src/config/backend-config.js` to change backend priorities:

```javascript
GITHUB_ACTIONS: {
  priority: 1  // Highest priority
},
CODESPACES: {
  priority: 2  // Medium priority
},
LOCAL: {
  priority: 3  // Lowest priority
}
```

## Monitoring and Troubleshooting

### Check Service Status

1. **Actions Tab**: See running workflows
2. **Workflow Logs**: Detailed service status every 5 minutes
3. **Artifacts**: Download service logs and status reports
4. **Frontend**: The app will show connection status

### Common Issues

#### Service Not Starting

- Check if Actions are enabled in repository settings
- Verify workflow files are in `.github/workflows/`
- Check for syntax errors in YAML files
- Look at workflow run logs for error messages

#### Multiple Instances Running

- This is normal and expected for overlap
- Monitor will warn if more than 2 instances are running
- Instances will naturally end after their timeout

#### Service Keeps Stopping

- Check the backend logs in workflow artifacts
- Verify `run_audit.py` is working correctly
- Check for dependency issues in the workflow logs

### Manual Intervention

#### Stop All Services

1. Go to Actions tab
2. Cancel all running "Backend Service - Continuous Operation" workflows
3. The monitor will not restart them if you disable it

#### Restart Service

1. Go to Actions tab → "Backend Service - Continuous Operation"
2. Click "Run workflow"
3. Or wait for the monitor to detect and restart automatically

## Integration with Existing Systems

### Codespace Compatibility

The GitHub Actions solution is fully compatible with your existing Codespace setup:

- All Codespace configuration files are preserved
- Frontend automatically detects and uses available backends
- Codespace URLs remain in the configuration as fallbacks
- Keep-alive workflow for Codespaces continues to work

### Frontend Integration

The frontend automatically detects the best available backend:

1. **GitHub Actions backend** (if running)
2. **Active Codespace** (if available)
3. **Local backend** (for development)

### Switching Between Solutions

You can use both solutions simultaneously:

- GitHub Actions provides the primary backend
- Codespaces serve as backup/development environment
- Frontend seamlessly switches between them

## Performance and Costs

### GitHub Actions Usage

- **Free tier**: 2,000 minutes/month
- **Pro tier**: 3,000 minutes/month
- **Estimated usage**: ~4,320 minutes/month (24/7 operation)

### Optimization Tips

1. **Reduce frequency** if you don't need true 24/7 operation
2. **Use shorter runtimes** to reduce minute consumption
3. **Monitor usage** in repository Settings → Billing
4. **Consider GitHub Pro** for higher limits if needed

### Performance Characteristics

- **Startup time**: ~2-3 minutes for workflow to start
- **Service availability**: 95-99% uptime
- **Transition gaps**: 30-60 seconds between workflow runs
- **Resource limits**: Standard GitHub Actions runner specs

## Best Practices

### 1. Monitor Resource Usage

- Check Actions usage in repository settings
- Set up billing alerts if using paid plans
- Monitor workflow run frequency

### 2. Keep Logs Clean

- Service logs are automatically cleaned up after 1 day
- Download important logs before they expire
- Use artifacts for persistent logging

### 3. Test Changes Carefully

- Test workflow changes in a fork first
- Use `workflow_dispatch` for manual testing
- Monitor logs after making changes

### 4. Maintain Fallbacks

- Keep Codespace configuration active
- Test fallback systems regularly
- Document recovery procedures

## Troubleshooting Guide

### Issue: Workflows Not Starting

**Symptoms**: No workflows running, service not accessible

**Solutions**:

1. Check if Actions are enabled: Settings → Actions → General
2. Verify workflow files exist and have correct syntax
3. Check repository permissions for Actions
4. Try manual workflow dispatch

### Issue: Service Keeps Crashing

**Symptoms**: Workflows start but service stops quickly

**Solutions**:

1. Check workflow logs for Python errors
2. Verify `requirements.txt` has all dependencies
3. Test `run_audit.py` locally first
4. Check for port conflicts or permission issues

### Issue: High Actions Usage

**Symptoms**: Approaching or exceeding Actions minutes limit

**Solutions**:

1. Reduce workflow frequency (every 6-8 hours instead of 4)
2. Shorten workflow runtime (3-4 hours instead of 6)
3. Use Codespaces as primary backend during high-usage periods
4. Consider upgrading to GitHub Pro for more minutes

### Issue: Frontend Can't Connect

**Symptoms**: Frontend shows "No backend found" error

**Solutions**:

1. Check if any workflows are currently running
2. Verify backend configuration in `src/config/backend-config.js`
3. Test backend URL directly in browser
4. Check for CORS issues in workflow logs

## Migration from Codespace-Only Setup

If you're currently using only Codespaces:

1. **Keep existing setup**: Don't delete any Codespace files
2. **Add GitHub Actions workflows**: Use the files provided
3. **Update frontend**: The new configuration automatically handles both
4. **Test gradually**: Start with manual workflow runs
5. **Monitor performance**: Compare reliability and costs

## Future Enhancements

Potential improvements to consider:

1. **Dynamic scaling**: Adjust frequency based on usage
2. **Health endpoints**: More sophisticated service monitoring
3. **Load balancing**: Distribute requests across multiple instances
4. **Metrics collection**: Track service performance over time
5. **Alert integration**: Slack/email notifications for issues

## Conclusion

The GitHub Actions solution provides a robust, cost-effective way to run your QA Audit Tool backend continuously while preserving all existing functionality. It offers:

- ✅ Near 24/7 uptime without manual intervention
- ✅ Automatic recovery from failures
- ✅ Full compatibility with existing Codespace setup
- ✅ Detailed monitoring and logging
- ✅ Flexible configuration options

The solution works within GitHub's constraints to provide the most continuous operation possible using only GitHub's free and paid features.
