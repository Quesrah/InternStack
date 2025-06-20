import os
import asyncio
import time
import requests
import json
from typing import Dict, Any, Tuple

class AIService:
    """Service for interacting with multiple AI providers"""
    
    def __init__(self):
        self.openai_api_key = os.getenv('OPENAI_API_KEY')
        self.anthropic_api_key = os.getenv('ANTHROPIC_API_KEY')
        self.together_api_key = os.getenv('TOGETHER_API_KEY')
        
        # Import AGENTS from api routes
        from src.routes.api import AGENTS
        self.agents = AGENTS
    
    def validate_model_availability(self, agent_id: str) -> Tuple[bool, str]:
        """Check if a model is available and properly configured"""
        agent = self.get_model_info(agent_id)
        if not agent:
            return False, f"Agent {agent_id} not found"
        
        if not agent['enabled']:
            return False, f"Agent {agent['name']} is not enabled (tier: {agent['tier']})"
        
        provider = agent['provider']
        
        # Check if required API key is available
        if provider == 'openai' and not self.openai_api_key:
            return False, f"OpenAI API key not configured for {agent['name']}"
        elif provider == 'anthropic' and not self.anthropic_api_key:
            return False, f"Anthropic API key not configured for {agent['name']}"
        elif provider == 'together' and not self.together_api_key:
            return False, f"Together.ai API key not configured for {agent['name']}"
        
        return True, "Model available"
    
    def get_model_info(self, agent_id: str) -> Dict[str, Any]:
        """Get model information for a specific agent"""
        for agent in self.agents:
            if agent['id'] == agent_id:
                return agent
        return None
    
    def get_completion(self, provider: str, model: str, prompt: str, timeout: int = 20) -> str:
        """Get completion from specified AI provider"""
        
        try:
            if provider == 'openai':
                return self._get_openai_completion(model, prompt, timeout)
            elif provider == 'anthropic':
                return self._get_anthropic_completion(model, prompt, timeout)
            elif provider == 'together':
                return self._get_together_completion(model, prompt, timeout)
            else:
                raise ValueError(f"Unsupported provider: {provider}")
                
        except requests.exceptions.Timeout:
            raise Exception(f"Request timed out after {timeout} seconds")
        except requests.exceptions.RequestException as e:
            raise Exception(f"Network error: {str(e)}")
        except Exception as e:
            raise Exception(f"API error: {str(e)}")
    
    def _get_openai_completion(self, model: str, prompt: str, timeout: int) -> str:
        """Get completion from OpenAI API"""
        if not self.openai_api_key:
            raise Exception("OpenAI API key not configured")
        
        response = requests.post(
            'https://api.openai.com/v1/chat/completions',
            headers={
                'Authorization': f'Bearer {self.openai_api_key}',
                'Content-Type': 'application/json'
            },
            json={
                'model': model,
                'messages': [{'role': 'user', 'content': prompt}],
                'max_tokens': 1000,
                'temperature': 0.7
            },
            timeout=timeout
        )
        
        if response.status_code != 200:
            error_detail = response.json().get('error', {}).get('message', 'Unknown error')
            raise Exception(f"OpenAI API error: {error_detail}")
        
        result = response.json()
        return result['choices'][0]['message']['content'].strip()
    
    def _get_anthropic_completion(self, model: str, prompt: str, timeout: int) -> str:
        """Get completion from Anthropic API"""
        if not self.anthropic_api_key:
            raise Exception("Anthropic API key not configured")
        
        response = requests.post(
            'https://api.anthropic.com/v1/messages',
            headers={
                'x-api-key': self.anthropic_api_key,
                'Content-Type': 'application/json',
                'anthropic-version': '2023-06-01'
            },
            json={
                'model': model,
                'max_tokens': 1000,
                'messages': [{'role': 'user', 'content': prompt}]
            },
            timeout=timeout
        )
        
        if response.status_code != 200:
            error_detail = response.json().get('error', {}).get('message', 'Unknown error')
            raise Exception(f"Anthropic API error: {error_detail}")
        
        result = response.json()
        return result['content'][0]['text'].strip()
    
    def _get_together_completion(self, model: str, prompt: str, timeout: int) -> str:
        """Get completion from Together.ai API"""
        if not self.together_api_key:
            raise Exception("Together.ai API key not configured")
        
        response = requests.post(
            'https://api.together.xyz/v1/chat/completions',
            headers={
                'Authorization': f'Bearer {self.together_api_key}',
                'Content-Type': 'application/json'
            },
            json={
                'model': model,  # Now uses correct model names like mistralai/Mistral-7B-Instruct-v0.1
                'messages': [{'role': 'user', 'content': prompt}],
                'max_tokens': 1000,
                'temperature': 0.7
            },
            timeout=timeout
        )
        
        if response.status_code != 200:
            try:
                error_detail = response.json().get('error', {}).get('message', 'Unknown error')
            except:
                error_detail = f"HTTP {response.status_code}: {response.text}"
            raise Exception(f"Together.ai API error: {error_detail}")
        
        result = response.json()
        return result['choices'][0]['message']['content'].strip()
    
    async def get_completion_async(self, provider: str, model: str, prompt: str, timeout: int = 20) -> str:
        """Async version of get_completion for concurrent requests"""
        # For now, we'll use the sync version in a thread pool
        # In a production app, you'd want to use aiohttp for true async
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(None, self.get_completion, provider, model, prompt, timeout)
    
    def get_provider_status(self) -> Dict[str, Dict[str, Any]]:
        """Get status of all AI providers"""
        status = {}
        
        # OpenAI status
        status['openai'] = {
            'configured': bool(self.openai_api_key),
            'models': [agent for agent in self.agents if agent['provider'] == 'openai'],
            'enabled_models': [agent for agent in self.agents if agent['provider'] == 'openai' and agent['enabled']]
        }
        
        # Anthropic status
        status['anthropic'] = {
            'configured': bool(self.anthropic_api_key),
            'models': [agent for agent in self.agents if agent['provider'] == 'anthropic'],
            'enabled_models': [agent for agent in self.agents if agent['provider'] == 'anthropic' and agent['enabled']]
        }
        
        # Together.ai status
        status['together'] = {
            'configured': bool(self.together_api_key),
            'models': [agent for agent in self.agents if agent['provider'] == 'together'],
            'enabled_models': [agent for agent in self.agents if agent['provider'] == 'together' and agent['enabled']]
        }
        
        return status
    
    def test_provider_connection(self, provider: str) -> Tuple[bool, str]:
        """Test connection to a specific provider"""
        try:
            test_prompt = "Hello, this is a test. Please respond with 'Test successful.'"
            
            if provider == 'openai':
                if not self.openai_api_key:
                    return False, "API key not configured"
                result = self._get_openai_completion('gpt-3.5-turbo', test_prompt, 10)
                return True, f"Success: {result[:50]}..."
                
            elif provider == 'anthropic':
                if not self.anthropic_api_key:
                    return False, "API key not configured"
                result = self._get_anthropic_completion('claude-instant-1.2', test_prompt, 10)
                return True, f"Success: {result[:50]}..."
                
            elif provider == 'together':
                if not self.together_api_key:
                    return False, "API key not configured"
                result = self._get_together_completion('mistralai/Mistral-7B-Instruct-v0.1', test_prompt, 10)
                return True, f"Success: {result[:50]}..."
                
            else:
                return False, f"Unknown provider: {provider}"
                
        except Exception as e:
            return False, f"Error: {str(e)}"

