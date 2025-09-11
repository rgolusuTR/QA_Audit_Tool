# Railway Deployment Guide for QA Audit Tool

## 🚀 Deploy to Railway for 24/7 Uptime

This guide will help you deploy the QA Audit Tool backend to Railway for permanent 24/7 operation, eliminating the GitHub Codespaces auto-stop issue.

## Prerequisites

1. **Railway Account**: Sign up at [railway.app](https://railway.app)
2. **GitHub Repository**: Your QA_Audit_Tool code should be in a GitHub repository

## Step-by-Step Deployment

### 1. Connect to Railway

1. Go to [railway.app](https://railway.app)
2. Click "Login" and sign in with your GitHub account
3. Click "New Project"
4. Select "Deploy from GitHub repo"
5. Choose your QA_Audit_Tool repository

### 2. Configure Deployment

Railway will automatically detect the Python project and use the following files:

- `requirements.txt` - Python dependencies
- `Procfile` - Start command: `web: cd backend && python main.py`
- `railway.json` - Railway-specific configuration

### 3. Environment Variables (Optional)

If needed, you can set environment variables in Railway:

- Go to your project dashboard
- Click on "Variables" tab
- Add any required environment variables

### 4. Deploy

1. Railway will automatically start building and deploying
2. Wait for the deployment to complete (usually 2-3 minutes)
3. You'll get a public URL like: `https://your-app-name.railway.app`

### 5. Test Your Deployment

Once deployed, test these endpoints:

- Health check: `https://your-app-name.railway.app/api/health`
- API docs: `https://your-app-name.railway.app/docs`
- Root endpoint: `https://your-app-name.railway.app/`

## Update Frontend Configuration

After successful deployment, update your frontend to use the Railway URL instead of Codespace URLs.

### Update App.tsx

Replace the `potentialUrls` array in `src/App.tsx` with your Railway URL:

```typescript
const potentialUrls = [
  "https://your-app-name.railway.app", // Replace with your actual Railway URL
];
```

## Benefits of Railway Deployment

✅ **24/7 Uptime**: No automatic stopping like Codespaces
✅ **Automatic Scaling**: Handles traffic spikes automatically
✅ **Free Tier**: Generous free tier for small applications
✅ **Custom Domains**: Add your own domain if needed
✅ **Automatic HTTPS**: SSL certificates included
✅ **Git Integration**: Auto-deploy on code changes
✅ **Health Monitoring**: Built-in health checks
✅ **Logs & Metrics**: Real-time application monitoring

## Monitoring Your Application

1. **Railway Dashboard**: Monitor deployments, logs, and metrics
2. **Health Endpoint**: `/api/health` for uptime monitoring
3. **Application Logs**: View real-time logs in Railway dashboard

## Troubleshooting

### Common Issues:

1. **Build Failures**: Check that all dependencies are in `requirements.txt`
2. **Port Issues**: Railway automatically assigns PORT environment variable
3. **Path Issues**: Ensure `cd backend &&` is in the start command

### Getting Help:

- Railway Documentation: [docs.railway.app](https://docs.railway.app)
- Railway Discord: [discord.gg/railway](https://discord.gg/railway)
- GitHub Issues: Create an issue in your repository

## Cost Considerations

- **Free Tier**: $5 worth of usage per month
- **Usage-Based**: Pay only for what you use
- **Typical Cost**: Small applications usually stay within free tier

## Next Steps

1. Deploy to Railway following this guide
2. Update frontend with Railway URL
3. Test the complete application
4. Monitor performance and uptime
5. Enjoy 24/7 operation without Codespace interruptions!

## Alternative Cloud Providers

If Railway doesn't meet your needs, consider:

- **Render**: Similar to Railway with free tier
- **Heroku**: Classic PaaS platform
- **DigitalOcean App Platform**: Simple deployment
- **Google Cloud Run**: Serverless container platform
- **AWS Lambda**: Serverless functions

---

**Note**: This deployment eliminates the GitHub Codespaces auto-stop issue and provides true 24/7 uptime for your QA Audit Tool backend.
