# Intern Stack - Placeholder Configuration Guide

This document lists all the placeholders in the codebase where you need to provide your specific information for deployment and customization.

## 🔧 Required Placeholders (Must Configure)

### 1. API Keys (.env files)

#### Backend Environment Variables (`backend/.env`)
```bash
# PLACEHOLDER: Add your actual API keys
OPENAI_API_KEY=your_openai_api_key_here
ANTHROPIC_API_KEY=your_anthropic_api_key_here
TOGETHER_API_KEY=your_together_api_key_here

# PLACEHOLDER: Generate a secure secret key for production
SECRET_KEY=your_secret_key_here_change_in_production

# PLACEHOLDER: Set your frontend domain for production
CORS_ORIGINS=https://your-frontend-domain.vercel.app
```

**Where to get API keys:**
- OpenAI: https://platform.openai.com/api-keys
- Anthropic: https://console.anthropic.com/
- Together.ai: https://api.together.xyz/settings/api-keys

#### Frontend Environment Variables (`frontend/.env.local`)
```bash
# PLACEHOLDER: Replace with your deployed backend URL
VITE_API_BASE_URL=https://your-backend-domain.railway.app/api
```

### 2. Deployment URLs

#### DEPLOYMENT.md
- Line 45: `CORS_ORIGINS=https://your-frontend-domain.vercel.app`
- Line 52: `VITE_API_BASE_URL=https://your-backend-domain.railway.app/api`
- Line 112: `curl https://your-backend-domain.railway.app/health`

#### Frontend .env.example
- Line 4: `VITE_API_BASE_URL=https://your-backend-domain.railway.app/api`

### 3. Contact Information

#### README.md
- Line 298: `4. Contact [your-email@domain.com](mailto:your-email@domain.com)`

Replace with your actual support email address.

### 4. Repository URL

#### README.md
- Line 65: `git clone <your-repository-url>`

Replace with your actual GitHub repository URL.

## 🎨 Optional Placeholders (Customization)

### 1. Branding and Logo

#### README.md
- Line 3: `![Intern Stack Logo](https://via.placeholder.com/200x80/4F46E5/FFFFFF?text=Intern+Stack)`

Replace with your actual logo URL or remove if not needed.

### 2. Domain Names

If you want to use custom domains instead of default hosting domains:

#### Production URLs
- Replace `your-frontend-domain.vercel.app` with your custom domain
- Replace `your-backend-domain.railway.app` with your custom domain

### 3. Company/Personal Information

#### README.md
- Line 302: Update acknowledgments section with your preferred credits
- Line 304: Update support contact information
- Line 306: Update footer with your information

### 4. License Information

#### README.md
- Line 286: Update license information if using a different license
- Consider adding a LICENSE file to your repository

## 🔐 Security Placeholders (Critical)

### 1. Secret Keys

#### Backend main.py
The application currently uses a default secret key. For production:

```python
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'asdf#FGSgvasgf$5$WGT')
```

**PLACEHOLDER: Generate a secure secret key:**
```bash
python -c "import secrets; print(secrets.token_hex(32))"
```

### 2. CORS Origins

#### Backend main.py
```python
cors_origins = os.getenv('CORS_ORIGINS', '*').split(',') if os.getenv('CORS_ORIGINS') else ['*']
```

**PLACEHOLDER: Set specific origins for production instead of wildcard '*'**

## 📝 Configuration Checklist

### Before Deployment
- [ ] Set all API keys in environment variables
- [ ] Generate secure secret key for production
- [ ] Configure CORS origins with your frontend domain
- [ ] Update backend API URL in frontend environment
- [ ] Replace placeholder contact email
- [ ] Update repository URL in README
- [ ] Test all API integrations locally

### After Deployment
- [ ] Verify environment variables are set in hosting platforms
- [ ] Test API endpoints with production URLs
- [ ] Confirm CORS configuration works
- [ ] Monitor API usage and costs
- [ ] Set up error tracking and monitoring

### Optional Customizations
- [ ] Replace placeholder logo with your branding
- [ ] Configure custom domains
- [ ] Update README with your company information
- [ ] Add LICENSE file if needed
- [ ] Customize UI colors and styling

## 🚨 Security Notes

1. **Never commit API keys to version control**
2. **Use environment variables for all sensitive data**
3. **Rotate API keys regularly**
4. **Monitor API usage for unexpected spikes**
5. **Set up billing alerts for AI provider accounts**
6. **Use HTTPS for all production communications**
7. **Implement rate limiting for production use**

## 📞 Need Help?

If you need assistance configuring any of these placeholders:

1. Check the main README.md troubleshooting section
2. Review the DEPLOYMENT.md guide
3. Consult the API provider documentation
4. Open an issue on GitHub

Remember: The application will work locally with just one API key configured, but you'll want all providers set up for the full experience.

