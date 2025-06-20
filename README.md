# Intern Stack - AI Agent Comparison Platform

![Intern Stack Logo](https://via.placeholder.com/200x80/4F46E5/FFFFFF?text=Intern+Stack)

**Compare AI agents side-by-side and get cross-assessments to make better decisions**

Intern Stack is a production-ready full-stack web application that allows users to select two AI agents, ask them questions, and receive both original responses and cross-assessments. Perfect for evaluating AI performance, making informed decisions, and understanding different AI perspectives.

## 🚀 Features

### Core Functionality
- **Agent Selection**: Choose from multiple AI providers (OpenAI, Anthropic, Together.ai)
- **Domain Grouping**: Agents organized by capability domains (Chat/Reasoning, Code, Analysis, Creative, etc.)
- **Best Practice Add-ons**: Enhance prompts with proven best practices
- **Side-by-Side Comparison**: View responses in parallel for easy comparison
- **Cross-Assessment**: Each agent evaluates the other's response for deeper insights
- **Tier System**: Free tier agents available immediately, premium tier coming soon

### Technical Features
- **Responsive Design**: Works seamlessly on desktop and mobile
- **Real-time Error Handling**: Graceful error messages and retry functionality
- **Production Ready**: Configured for deployment on Vercel and Railway/Render
- **Modular Architecture**: Easy to extend with new agents and features
- **Cost Optimized**: Uses affordable AI APIs for the free tier

## 🛠️ Technology Stack

### Frontend
- **React 18** with modern hooks and functional components
- **Tailwind CSS** for responsive, utility-first styling
- **shadcn/ui** for consistent, accessible UI components
- **Lucide Icons** for beautiful, consistent iconography
- **Vite** for fast development and optimized builds

### Backend
- **Flask** with production-ready configuration
- **Flask-CORS** for secure cross-origin requests
- **Multiple AI Providers**: OpenAI, Anthropic, Together.ai integration
- **Comprehensive Error Handling** with timeout management
- **Environment-based Configuration** for security

### Deployment
- **Frontend**: Vercel (recommended) or Netlify
- **Backend**: Railway (recommended) or Render
- **Environment Variables**: Secure API key management
- **Custom Domains**: Support for branded URLs

## 📋 Prerequisites

- **Node.js** 18+ and pnpm
- **Python** 3.11+ and pip
- **Git** for version control
- **API Keys** from AI providers (see setup section)

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone <your-repository-url>
cd intern-stack
```

### 2. Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\\Scripts\\activate
pip install -r requirements.txt

# Copy environment template and add your API keys
cp .env.example .env
# Edit .env with your API keys (see Configuration section)

# Start the backend server
python src/main.py
```

### 3. Frontend Setup
```bash
cd frontend
pnpm install

# Copy environment template
cp .env.example .env.local
# Edit .env.local if needed (default points to localhost:5001)

# Start the frontend development server
pnpm run dev
```

### 4. Open Your Browser
Navigate to `http://localhost:5173` to see the application running.

## ⚙️ Configuration

### Required API Keys

You'll need API keys from at least one of these providers to use the application:

#### OpenAI (for GPT-3.5, GPT-4)
1. Visit [OpenAI Platform](https://platform.openai.com/api-keys)
2. Create an account and generate an API key
3. Add to `.env`: `OPENAI_API_KEY=your_key_here`

#### Anthropic (for Claude models)
1. Visit [Anthropic Console](https://console.anthropic.com/)
2. Create an account and generate an API key
3. Add to `.env`: `ANTHROPIC_API_KEY=your_key_here`

#### Together.ai (for Mixtral, Llama models)
1. Visit [Together.ai](https://api.together.xyz/settings/api-keys)
2. Create an account and generate an API key
3. Add to `.env`: `TOGETHER_API_KEY=your_key_here`

### Environment Variables

#### Backend (.env)
```bash
# AI Provider API Keys
OPENAI_API_KEY=your_openai_api_key_here
ANTHROPIC_API_KEY=your_anthropic_api_key_here
TOGETHER_API_KEY=your_together_api_key_here

# Flask Configuration
FLASK_ENV=development  # Change to 'production' for deployment
SECRET_KEY=your_secret_key_here

# CORS Configuration
CORS_ORIGINS=http://localhost:5173  # Add your frontend domain for production
```

#### Frontend (.env.local)
```bash
# Backend API URL
VITE_API_BASE_URL=http://localhost:5001/api  # Change for production
```

## 🏗️ Architecture

### Project Structure
```
intern-stack/
├── backend/                 # Flask API server
│   ├── src/
│   │   ├── routes/         # API endpoints
│   │   ├── services/       # AI provider integrations
│   │   ├── models/         # Data models (for future database)
│   │   └── main.py         # Application entry point
│   ├── requirements.txt    # Python dependencies
│   └── .env.example       # Environment template
├── frontend/               # React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── assets/         # Static assets
│   │   └── App.jsx         # Main application component
│   ├── package.json        # Node.js dependencies
│   └── .env.example       # Environment template
├── DEPLOYMENT.md          # Deployment guide
└── README.md             # This file
```

### API Endpoints

#### GET /api/agents
Returns list of available AI agents with metadata
```json
{
  "agents": [
    {
      "id": "gpt-3.5",
      "name": "GPT-3.5 Turbo",
      "provider": "openai",
      "domains": ["Chat/Reasoning", "Code", "Analysis"],
      "tags": ["General-purpose Q&A", "Python", "Summarization"],
      "tier": "free",
      "enabled": true
    }
  ]
}
```

#### GET /api/best-practices
Returns available best-practice phrases
```json
{
  "phrases": [
    "Ask me any questions before you begin.",
    "List your response in numbered steps.",
    "Explain your reasoning."
  ]
}
```

#### POST /api/compare
Main comparison endpoint
```json
{
  "agent1_id": "gpt-3.5",
  "agent2_id": "claude-instant",
  "question": "How do I implement a binary search algorithm?",
  "best_practices": ["List your response in numbered steps."]
}
```

## 🚀 Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for comprehensive deployment instructions.

### Quick Deployment Summary

#### Frontend (Vercel)
```bash
cd frontend
pnpm run build
vercel --prod
```

#### Backend (Railway)
```bash
cd backend
railway init
railway up
```

## 💰 Cost Considerations

### Free Tier Agents
- **GPT-3.5 Turbo**: ~$0.002/1K tokens
- **Mixtral 8x7B**: Free tier available on Together.ai
- **Claude Instant**: ~$0.0024/1K tokens

### Estimated Monthly Costs (1000 comparisons)
- **Light Usage**: $5-10/month
- **Medium Usage**: $20-50/month
- **Heavy Usage**: $100+/month

### Cost Optimization Tips
- Start with free tier agents
- Monitor token usage
- Implement user rate limiting
- Cache common responses

## 🔧 Development

### Adding New AI Agents
1. Update `AGENTS` configuration in `src/routes/api.py`
2. Add provider integration in `src/services/ai_service.py`
3. Test with new agent ID

### Customizing UI
- Modify `src/App.jsx` for layout changes
- Update `src/App.css` for styling
- Add new components in `src/components/`

### Database Integration (Future)
The application is designed to easily add database functionality:
- User accounts and authentication
- Saved comparisons and history
- Usage analytics and rate limiting
- Custom agent configurations

## 🐛 Troubleshooting

### Common Issues

#### "API key not configured" Error
- Verify API keys are set in `.env` file
- Restart the backend server after adding keys
- Check for typos in environment variable names

#### CORS Errors
- Ensure backend is running on correct port
- Check CORS_ORIGINS configuration
- Verify frontend API_BASE_URL setting

#### Build Failures
- Check Node.js version (18+ required)
- Clear node_modules and reinstall: `rm -rf node_modules && pnpm install`
- Verify all dependencies are installed

### Debug Commands
```bash
# Check backend health
curl http://localhost:5001/api/health

# Test API endpoints
curl http://localhost:5001/api/agents

# Check frontend build
cd frontend && pnpm run build

# View backend logs
cd backend && python src/main.py
```

## 🤝 Contributing

### Development Workflow
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Make your changes
4. Test thoroughly
5. Submit a pull request

### Code Style
- **Python**: Follow PEP 8 guidelines
- **JavaScript**: Use ESLint configuration
- **React**: Functional components with hooks
- **CSS**: Tailwind utility classes preferred

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **OpenAI** for GPT models and API
- **Anthropic** for Claude models
- **Together.ai** for open-source model hosting
- **Vercel** for frontend hosting
- **Railway/Render** for backend hosting
- **shadcn/ui** for beautiful UI components

## 📞 Support

For support, please:
1. Check the [troubleshooting section](#-troubleshooting)
2. Review the [deployment guide](./DEPLOYMENT.md)
3. Open an issue on GitHub
4. Contact [your-email@domain.com](mailto:your-email@domain.com)

---

**Built with ❤️ for the AI community**

*Intern Stack - Making AI comparison simple and insightful*

