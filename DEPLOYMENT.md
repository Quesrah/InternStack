# Intern Stack - Production Deployment Guide

## Overview
This guide covers deploying the Intern Stack application to production using:
- **Frontend**: Vercel (React app)
- **Backend**: Railway or Render (Flask API)

## Prerequisites
- Node.js 18+ and pnpm
- Python 3.11+ and pip
- Git repository
- API keys for AI providers

## Environment Variables

### Backend (.env)
Create a `.env` file in the `backend/` directory:

```bash
# AI Provider API Keys
OPENAI_API_KEY=your_openai_api_key_here
ANTHROPIC_API_KEY=your_anthropic_api_key_here
TOGETHER_API_KEY=your_together_api_key_here

# Flask Configuration
FLASK_ENV=production
SECRET_KEY=your_production_secret_key_here

# CORS Configuration
CORS_ORIGINS=https://your-frontend-domain.vercel.app
```

### Frontend (.env.local)
Create a `.env.local` file in the `frontend/` directory:

```bash
# Backend API URL
VITE_API_BASE_URL=https://your-backend-domain.railway.app/api
```

## Backend Deployment (Railway/Render)

### Option 1: Railway
1. Install Railway CLI: `npm install -g @railway/cli`
2. Login: `railway login`
3. Navigate to backend: `cd backend`
4. Initialize: `railway init`
5. Set environment variables in Railway dashboard
6. Deploy: `railway up`

### Option 2: Render
1. Connect your GitHub repository to Render
2. Create a new Web Service
3. Set build command: `pip install -r requirements.txt`
4. Set start command: `python src/main.py`
5. Add environment variables in Render dashboard

### Backend Configuration for Production
Update `src/main.py` for production:

```python
import os
from flask import Flask, send_from_directory
from flask_cors import CORS
from src.routes.api import api_bp

app = Flask(__name__)
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'fallback-secret-key')

# Production CORS configuration
cors_origins = os.getenv('CORS_ORIGINS', '*').split(',')
CORS(app, origins=cors_origins)

app.register_blueprint(api_bp, url_prefix='/api')

@app.route('/health')
def health_check():
    return {"status": "healthy"}

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)
```

## Frontend Deployment (Vercel)

### Vercel Deployment
1. Install Vercel CLI: `npm install -g vercel`
2. Navigate to frontend: `cd frontend`
3. Build the app: `pnpm run build`
4. Deploy: `vercel --prod`
5. Set environment variables in Vercel dashboard

### Frontend Configuration for Production
Update `src/App.jsx` to use environment variable:

```javascript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';
```

## Domain Configuration

### Custom Domains
1. **Frontend**: Configure custom domain in Vercel dashboard
2. **Backend**: Configure custom domain in Railway/Render dashboard
3. Update CORS_ORIGINS environment variable with your frontend domain

## Security Considerations

### API Keys
- Never commit API keys to version control
- Use environment variables for all sensitive data
- Rotate API keys regularly
- Monitor API usage and costs

### CORS
- Set specific origins in production (not wildcard *)
- Use HTTPS for all communications
- Implement rate limiting if needed

## Monitoring and Logging

### Backend Monitoring
- Use Railway/Render built-in monitoring
- Implement structured logging
- Set up error tracking (e.g., Sentry)

### Frontend Monitoring
- Use Vercel Analytics
- Implement error boundaries
- Track user interactions

## Cost Optimization

### Free Tier Limits
- **Vercel**: 100GB bandwidth, 6,000 build minutes
- **Railway**: $5 credit monthly, 500 hours
- **Render**: 750 hours free tier

### API Cost Management
- Monitor token usage
- Implement request caching
- Set usage limits per user
- Use cheaper models for development

## Scaling Considerations

### Backend Scaling
- Use Railway/Render auto-scaling
- Implement database for user sessions
- Add Redis for caching
- Consider CDN for static assets

### Frontend Scaling
- Vercel handles scaling automatically
- Optimize bundle size
- Implement code splitting
- Use service workers for caching

## Troubleshooting

### Common Issues
1. **CORS errors**: Check CORS_ORIGINS configuration
2. **API key errors**: Verify environment variables
3. **Build failures**: Check Node.js/Python versions
4. **Timeout errors**: Increase timeout limits

### Debug Commands
```bash
# Check backend health
curl https://your-backend-domain.railway.app/health

# Check frontend build
cd frontend && pnpm run build

# Test API locally
cd backend && python src/main.py
```

## Maintenance

### Regular Tasks
- Update dependencies monthly
- Monitor API costs weekly
- Review error logs daily
- Backup environment configurations

### Updates
- Test changes locally first
- Use staging environment
- Deploy backend before frontend
- Monitor deployment metrics

