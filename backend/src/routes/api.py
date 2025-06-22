from flask import Blueprint, jsonify, request
import asyncio
import time
from src.services.ai_service import AIService

api_bp = Blueprint('api', __name__)

# Updated AI Agents Configuration with Corrected Models
AGENTS = [
    # OpenAI Models
    {
        "id": "gpt-3.5",
        "name": "GPT-3.5 Turbo",
        "provider": "openai",
        "model": "gpt-3.5-turbo",
        "domains": ["Chat/Reasoning", "Code", "Analysis"],
        "tags": ["General-purpose Q&A", "Python", "Summarization"],
        "tier": "free",
        "enabled": True
    },
    {
        "id": "gpt-4",
        "name": "GPT-4",
        "provider": "openai",
        "model": "gpt-4",
        "domains": ["Chat/Reasoning", "Code", "Analysis", "Creative"],
        "tags": ["Advanced reasoning", "Complex tasks", "Creative writing"],
        "tier": "premium",
        "enabled": True
    },
    
    # Mistral AI Models (via Together.ai)
    {
        "id": "mistral-7b",
        "name": "Mistral 7B",
        "provider": "together",
        "model": "mistralai/Mistral-7B-Instruct-v0.1",
        "domains": ["Chat/Reasoning", "Analysis"],
        "tags": ["General-purpose Q&A", "Fast responses"],
        "tier": "free",
        "enabled": True
    },
    {
        "id": "mixtral-8x7b",
        "name": "Mixtral 8x7B",
        "provider": "together",
        "model": "mistralai/Mixtral-8x7B-Instruct-v0.1",
        "domains": ["Chat/Reasoning", "Code", "Analysis"],
        "tags": ["Advanced reasoning", "Code generation", "Multi-lingual"],
        "tier": "free",
        "enabled": True
    },
    
    # Meta Llama Models (via Together.ai)
    {
        "id": "llama-2-7b",
        "name": "Llama 2 7B",
        "provider": "together",
        "model": "meta-llama/Llama-2-7b-chat-hf",
        "domains": ["Chat/Reasoning"],
        "tags": ["General-purpose Q&A", "Open source"],
        "tier": "free",
        "enabled": False
    },
    {
        "id": "code-llama",
        "name": "Code Llama 7B",
        "provider": "together",
        "model": "codellama/CodeLlama-7b-Instruct-hf",
        "domains": ["Code"],
        "tags": ["Python", "JavaScript", "Code generation"],
        "tier": "free",
        "enabled": False
    },
    
    # Anthropic Models
    {
        "id": "claude-instant",
        "name": "Claude Instant",
        "provider": "anthropic",
        "model": "claude-3-haiku-20240307",
        "domains": ["Chat/Reasoning", "Analysis", "Creative"],
        "tags": ["General-purpose Q&A", "Insight extraction", "Writing"],
        "tier": "free",
        "enabled": True
    },
    {
        "id": "claude-3-haiku",
        "name": "Claude 3 Haiku",
        "provider": "anthropic",
        "model": "claude-3-haiku-20240307",
        "domains": ["Chat/Reasoning", "Analysis"],
        "tags": ["Fast responses", "Cost-effective"],
        "tier": "premium",
        "enabled": False
    }
]

# Best practice phrases that can be added to prompts
BEST_PRACTICES = [
    "List your response in numbered steps.",
    "Explain your reasoning.",
    "Keep it concise unless asked for depth.",
    "Cite sources.",
    "Break it down as if explaining to a 12-year-old."
    "Be succinct."
]

@api_bp.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "timestamp": time.time(),
        "service": "Intern Stack API"
    })

@api_bp.route('/agents', methods=['GET'])
def get_agents():
    """Get list of available AI agents"""
    try:
        return jsonify({
            "agents": AGENTS,
            "total": len(AGENTS),
            "enabled": len([a for a in AGENTS if a['enabled']]),
            "free_tier": len([a for a in AGENTS if a['tier'] == 'free' and a['enabled']]),
            "premium_tier": len([a for a in AGENTS if a['tier'] == 'premium'])
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@api_bp.route('/best-practices', methods=['GET'])
def get_best_practices():
    """Get list of best practice phrases"""
    try:
        return jsonify({
            "phrases": BEST_PRACTICES,
            "total": len(BEST_PRACTICES)
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@api_bp.route('/compare', methods=['POST'])
def compare_agents():
    """Main endpoint for comparing two AI agents"""
    try:
        print("=== COMPARE ENDPOINT CALLED ===")
        data = request.get_json()
        print(f"Request data received: {data}")
        agent1_id = data.get('agent1_id')
        agent2_id = data.get('agent2_id')
        question = data.get('question')
        best_practices = data.get('best_practices', [])
        context = data.get('context',None)
        conversation_history = data.get('conversation_history',[])
        
        # Validate input
        if not agent1_id or not agent2_id or not question:
            return jsonify({"error": "Missing required fields: agent1_id, agent2_id, question"}), 400
        
        if agent1_id == agent2_id:
            return jsonify({"error": "Cannot compare an agent with itself"}), 400
        
        # Initialize AI service
        print("About to initialize AIService...")
        ai_service = AIService()
        print("AIService initialized successfully")
        
        # Validate models are available
        valid1, msg1 = ai_service.validate_model_availability(agent1_id)
        if not valid1:
            return jsonify({'error': f'Agent 1: {msg1}'}), 400
            
        valid2, msg2 = ai_service.validate_model_availability(agent2_id)
        if not valid2:
            return jsonify({'error': f'Agent 2: {msg2}'}), 400
        
        # Build enhanced prompt with best practices
        enhanced_question = question
        if best_practices:
            enhanced_question += "\n\nAlso: " + " ".join(best_practices)

        # Add follow-up context if this is a follow-up question
        if conversation_history:
            enhanced_question = "Conversation history:\n"
            for i, exchange in enumerate(conversation_history):
                enhanced_question += f"\nQ{i+1}: {exchange['question']}\n"
                enhanced_question += f"Your previous response: {exchange.get('agent1_response' if agent1_id else 'agent2_response', '')}\n"
                enhanced_question += f"Other agent's response: {exchange.get('agent2_response' if agent1_id else 'agent1_response', '')}\n"
            enhanced_question += f"\nCurrent question: {question}"
        elif context:
            enhanced_question = f"Previous question: {context['original_question']}\n"
            enhanced_question += f"Your previous response: {context['original_responses'].get('agent1' if agent1_id == 'gpt-3.5' else 'agent2', '')}\n"
            enhanced_question += f"Other agent's response: {context['original_responses'].get('agent2' if agent1_id == 'gpt-3.5' else 'agent1', '')}\n\n"
            enhanced_question += f"Follow-up question: {question}"
        
        # Add best practices
        if best_practices:
            enhanced_question += "\n\nAlso: " + " ".join(best_practices)
        
        # Get agent information
        agent1_info = ai_service.get_model_info(agent1_id)
        agent2_info = ai_service.get_model_info(agent2_id)
        
        # Step 1: Get initial responses from both agents
        print("Aboutto call first AI service...")
        try:
            response1 = ai_service.get_completion(
                agent1_info['provider'], 
                agent1_info['model'], 
                enhanced_question
            )
        except Exception as e:
            print(f"FULL ERROR: {str(e)}")
            import traceback
            traceback.print_exc()
            return jsonify({
                "error": f"Error getting response from {agent1_info['name']}: {str(e)}"
            }), 500
        
        try:
            response2 = ai_service.get_completion(
                agent2_info['provider'], 
                agent2_info['model'], 
                enhanced_question
            )
        except Exception as e:
            return jsonify({
                "error": f"Error getting response from {agent2_info['name']}: {str(e)}"
            }), 500 
        
        # Return comprehensive comparison results
        return jsonify({
            "question": question,
            "best_practices_used": best_practices,
            "agent1": {
                "id": agent1_id,
                "name": agent1_info['name'],
                "provider": agent1_info['provider'],
                "domains": agent1_info['domains'],
                "tags": agent1_info['tags'],
                "response": response1,
            },
            "agent2": {
                "id": agent2_id,
                "name": agent2_info['name'],
                "provider": agent2_info['provider'],
                "domains": agent2_info['domains'],
                "tags": agent2_info['tags'],
                "response": response2,
            },
            "timestamp": time.time()
        })
        
    except Exception as e:
        return jsonify({"error": f"Unexpected error: {str(e)}"}), 500


@api_bp.route('/assess', methods=['POST'])
def assess_responses():
    """Get cross-assessments for existing responses"""
    try:
        data = request.get_json()
        agent1_id = data.get('agent1_id')
        agent2_id = data.get('agent2_id')
        question = data.get('question')
        agent1_response = data.get('agent1_response')
        agent2_response = data.get('agent2_response')
        assessment_criteria = data.get('assessment_criteria',[])
        
        # Validate input
        if not all([agent1_id, agent2_id, question, agent1_response, agent2_response]):
            return jsonify({"error": "Missing required fields"}), 400
        
        # Initialize AI service
        ai_service = AIService()
        
        # Get agent information
        agent1_info = ai_service.get_model_info(agent1_id)
        agent2_info = ai_service.get_model_info(agent2_id)
        
        # Build assessment criteria text
        if assessment_criteria:
            criteria_text = "Focus your assessment on these specific aspects:\n" + "\n".join([f"- {criteria}" for criteria in assessment_criteria])
        else:
            criteria_text = "Assess its accuracy and completeness. Suggest improvements or revisions if needed."
        
        assessment_prompt_template = """I asked the following question:
"{question}"

I received this answer:
"{answer}"

{criteria}"""

        
        # Agent 2 assesses Agent 1's response
        try:
            assessment_of_agent1 = ai_service.get_completion(
                agent2_info['provider'],
                agent2_info['model'],
                assessment_prompt_template.format(question=question, answer=agent1_response, criteria=criteria_text)
            )
        except Exception as e:
            assessment_of_agent1 = f"Error getting assessment: {str(e)}"
        
        # Agent 1 assesses Agent 2's response
        try:
            assessment_of_agent2 = ai_service.get_completion(
                agent1_info['provider'],
                agent1_info['model'],
                assessment_prompt_template.format(question=question, answer=agent2_response, criteria=criteria_text)
            )
        except Exception as e:
            assessment_of_agent2 = f"Error getting assessment: {str(e)}"
        
        return jsonify({
            "agent1_assessment_by_agent2": assessment_of_agent1,
            "agent2_assessment_by_agent1": assessment_of_agent2,
            "assessor_info": {
                "agent1_name": agent1_info['name'],
                "agent2_name": agent2_info['name']
            }
        })
        
    except Exception as e:
        return jsonify({"error": f"Assessment error: {str(e)}"}), 500


@api_bp.route('/agent/<agent_id>', methods=['GET'])
def get_agent_details(agent_id):
    """Get detailed information about a specific agent"""
    try:
        ai_service = AIService()
        agent_info = ai_service.get_model_info(agent_id)
        
        if not agent_info:
            return jsonify({"error": f"Agent {agent_id} not found"}), 404
        
        # Check availability
        available, message = ai_service.validate_model_availability(agent_id)
        
        return jsonify({
            "agent": agent_info,
            "available": available,
            "status_message": message
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

