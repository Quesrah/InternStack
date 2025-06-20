# Intern Stack API Design

## API Endpoints

### GET /api/agents
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
    },
    {
      "id": "mixtral",
      "name": "Mixtral 8x7B",
      "provider": "together",
      "domains": ["Chat/Reasoning", "Code"],
      "tags": ["General-purpose Q&A", "Python"],
      "tier": "free",
      "enabled": true
    },
    {
      "id": "claude-instant",
      "name": "Claude Instant",
      "provider": "anthropic",
      "domains": ["Chat/Reasoning", "Analysis", "Creative"],
      "tags": ["General-purpose Q&A", "Insight extraction", "Writing"],
      "tier": "free",
      "enabled": true
    },
    {
      "id": "gpt-4",
      "name": "GPT-4",
      "provider": "openai",
      "domains": ["Chat/Reasoning", "Code", "Analysis"],
      "tags": ["General-purpose Q&A", "Python", "Summarization"],
      "tier": "premium",
      "enabled": false
    }
  ]
}
```

### GET /api/best-practices
Returns available best-practice phrases
```json
{
  "phrases": [
    "Ask me any questions before you begin.",
    "List your response in numbered steps.",
    "Explain your reasoning.",
    "Keep it concise unless asked for depth.",
    "Cite sources.",
    "Break it down as if explaining to a 12-year-old."
  ]
}
```

### POST /api/compare
Main comparison endpoint
```json
{
  "agent1_id": "gpt-3.5",
  "agent2_id": "mixtral",
  "question": "How do I implement a binary search algorithm?",
  "best_practices": ["List your response in numbered steps.", "Explain your reasoning."]
}
```

Response:
```json
{
  "success": true,
  "agent1": {
    "id": "gpt-3.5",
    "name": "GPT-3.5 Turbo",
    "original_response": "...",
    "assessment_by_agent2": "..."
  },
  "agent2": {
    "id": "mixtral", 
    "name": "Mixtral 8x7B",
    "original_response": "...",
    "assessment_by_agent1": "..."
  },
  "timestamp": "2025-06-19T10:30:00Z"
}
```

## Data Structures

### Agent Configuration
```python
AGENTS = {
    "gpt-3.5": {
        "name": "GPT-3.5 Turbo",
        "provider": "openai",
        "model": "gpt-3.5-turbo",
        "domains": ["Chat/Reasoning", "Code", "Analysis"],
        "tags": ["General-purpose Q&A", "Python", "Summarization"],
        "tier": "free",
        "enabled": True,
        "max_tokens": 2000,
        "temperature": 0.7
    },
    "mixtral": {
        "name": "Mixtral 8x7B",
        "provider": "together",
        "model": "mistralai/Mixtral-8x7B-Instruct-v0.1",
        "domains": ["Chat/Reasoning", "Code"],
        "tags": ["General-purpose Q&A", "Python"],
        "tier": "free", 
        "enabled": True,
        "max_tokens": 2000,
        "temperature": 0.7
    },
    "claude-instant": {
        "name": "Claude Instant",
        "provider": "anthropic",
        "model": "claude-instant-1.2",
        "domains": ["Chat/Reasoning", "Analysis", "Creative"],
        "tags": ["General-purpose Q&A", "Insight extraction", "Writing"],
        "tier": "free",
        "enabled": True,
        "max_tokens": 2000,
        "temperature": 0.7
    }
}
```

### Best Practice Phrases
```python
BEST_PRACTICES = [
    "Ask me any questions before you begin.",
    "List your response in numbered steps.",
    "Explain your reasoning.",
    "Keep it concise unless asked for depth.",
    "Cite sources.",
    "Break it down as if explaining to a 12-year-old."
]
```

## Error Handling

### Error Response Format
```json
{
  "success": false,
  "error": {
    "code": "AGENT_TIMEOUT",
    "message": "Agent timed out after 20 seconds",
    "agent_id": "gpt-3.5"
  }
}
```

### Error Codes
- `AGENT_TIMEOUT`: Agent response took longer than 20 seconds
- `AGENT_ERROR`: Agent returned an error response
- `INVALID_AGENT`: Requested agent ID not found or disabled
- `API_KEY_MISSING`: Required API key not configured
- `RATE_LIMIT_EXCEEDED`: API rate limit exceeded
- `VALIDATION_ERROR`: Invalid request parameters

