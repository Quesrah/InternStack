import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';
import { Textarea } from '@/components/ui/textarea.jsx';
import { Checkbox } from '@/components/ui/checkbox.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { Loader2, Brain, Zap, AlertCircle, RefreshCw, Users, SquareStack, ArrowRightLeft } from 'lucide-react';
import './App.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';

const ASSESSMENT_CRITERIA = [
  'Accuracy & factual correctness',
  'Completeness & thoroughness',
  'Clarity & communication',
  'Practical applicability',
  'Creative approach',
  'Technical depth',
  'Potential risks or limitations'
];

function App() {
  const [agents, setAgents] = useState([]);
  const [bestPractices, setBestPractices] = useState([]);
  const [selectedAgent1, setSelectedAgent1] = useState('');
  const [selectedAgent2, setSelectedAgent2] = useState('');
  const [question, setQuestion] = useState('');
  const [selectedPractices, setSelectedPractices] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [followUps, setFollowUps] = useState([]);  
  const [followUpQuestions, setFollowUpQuestions] = useState({});
  const [isFollowUpLoading, setIsFollowUpLoading] = useState(false);
  const [showFollowUpInput, setShowFollowUpInput] = useState(false);
  const [conversationHistory, setConversationHistory] = useState([]);
  const [activeFollowUpIndex, setActiveFollowUpIndex] = useState(-1); 
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [currentFollowUpQuestion, setCurrentFollowUpQuestion] = useState('');
  const [assessments, setAssessments] = useState(null); 
  const [followUpAssessments, setFollowUpAssessments] = useState([]); 
  const [isAssessmentLoading, setIsAssessmentLoading] = useState(false); 
  const [selectedAssessmentCriteria, setSelectedAssessmentCriteria] = useState([]);
  const [showAssessmentOptions, setShowAssessmentOptions] = useState(false);


  // Load agents and best practices on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [agentsResponse, practicesResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/agents`),
          fetch(`${API_BASE_URL}/best-practices`)
        ]);

        if (agentsResponse.ok) {
          const agentsData = await agentsResponse.json();
          setAgents(agentsData.agents);
        }

        if (practicesResponse.ok) {
          const practicesData = await practicesResponse.json();
          setBestPractices(practicesData.phrases);
        }
      } catch (err) {
        console.error('Failed to load initial data:', err);
        setError('Failed to load application data. Please refresh the page.');
      }
    };

    fetchData();
  }, []);

  const handlePracticeToggle = (practice) => {
    setSelectedPractices(prev => 
      prev.includes(practice) 
        ? prev.filter(p => p !== practice)
        : [...prev, practice]
    );
  };

  const handleCompare = async () => {
    if (!selectedAgent1 || !selectedAgent2 || !question.trim()) {
      setError('Select two agents and enter a question.');
      return;
    }

    if (selectedAgent1 === selectedAgent2) {
      setError('Please select two different agents.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResults(null);

    try {
      // Create AbortController for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 120000); // 2 minutes

      const response = await fetch(`${API_BASE_URL}/compare`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          agent1_id: selectedAgent1,
          agent2_id: selectedAgent2,
          question: question.trim(),
          best_practices: selectedPractices
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId); // Clear timeout on success
      const data = await response.json();

	console.log('=== API RESPONSE DEBUG ===');
	console.log('Full response:', data);
	console.log('Agent1 response field:', data.agent1?.response);
	console.log('Agent1 original_response field:', data.agent1?.original_response);
	console.log('Agent2 response field:', data.agent2?.response);
	console.log('Agent2 original_response field:', data.agent2?.original_response);

      if (data.agent1 && data.agent2) {
        setResults(data);
        setFollowUps([]);
        setFollowUpQuestions({});
        setActiveFollowUpIndex(-1);
        setShowFollowUpInput(false);
        setAssessments(null);
        setFollowUpAssessments([]);
        setSelectedAssessmentCriteria([]);
        // Add to conversation history
        setConversationHistory([{
          question: question.trim(),
          agent1_response: data.agent1.response,
          agent2_response: data.agent2.response
        }]);
      } else {
        setError(data.error?.message || 'An error occurred during comparison.');
      }

    } catch (err) {
      if (err.name === 'AbortError') {
        console.error('Request timed out after 2 minutes');
        setError('Request timed out. AI responses are taking longer than expected. Please try again.');
      } else {
        console.error('Comparison failed:', err);
        setError('Failed to compare agents. Please check your connection and try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    setError(null);
    setResults(null);
  };

const handleAssessmentCriteriaToggle = (criteria) => {
    setSelectedAssessmentCriteria(prev => 
      prev.includes(criteria) 
        ? prev.filter(c => c !== criteria)
        : [...prev, criteria]
    );
  };

  const handleGetAssessment = async (questionText, agent1Response, agent2Response, isFollowUp = false, followUpIndex = null) => {
    setIsAssessmentLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/assess`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          agent1_id: selectedAgent1,
          agent2_id: selectedAgent2,
          question: questionText,
          agent1_response: agent1Response,
          agent2_response: agent2Response,
          assessment_criteria: selectedAssessmentCriteria
        }),
      });

      const data = await response.json();

      if (response.ok) {
        if (isFollowUp && followUpIndex !== null) {
          // Store follow-up assessment
          setFollowUpAssessments(prev => {
            const newAssessments = [...prev];
            newAssessments[followUpIndex] = data;
            return newAssessments;
          });
        } else {
          // Store original assessment
          setAssessments(data);
        }
      } else {
        setError(data.error || 'Failed to get assessment');
      }
    } catch (error) {
      setError('Failed to get assessment. Please try again.');
    } finally {
      setIsAssessmentLoading(false);
    }
  };

  const handleFollowUp = async (followUpIndex) => {
  const questionText = followUpQuestions[followUpIndex]; 
  if (!questionText || !questionText.trim()) {
    setError('Enter a follow-up question.');
    return;
  }

  setIsFollowUpLoading(true);
  setError(null);

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 120000);

    const response = await fetch(`${API_BASE_URL}/compare`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        agent1_id: selectedAgent1,
        agent2_id: selectedAgent2,
        question: questionText.trim(),
        best_practices: selectedPractices,
	conversation_history: conversationHistory
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);
    const data = await response.json();

    if (data.agent1 && data.agent2) {
      setFollowUps(prev => {
        const newFollowUps = [...prev];
        newFollowUps[followUpIndex] = {
          question: questionText.trim(),
          results: data
     };
      return newFollowUps;
     });
           
      // Add follow-up to conversation history
      setConversationHistory(prev => [...prev, {
        question: questionText.trim(),
        agent1_response: data.agent1.response,
        agent2_response: data.agent2.response
      }]);
    } else {
      setError(data.error?.message || 'An error occurred during follow-up comparison.');
    }
  } catch (err) {
    if (err.name === 'AbortError') {
      setError('Follow-up request timed out. Please try again.');
    } else {
      console.error('Follow-up failed:', err);
      setError('Failed to process follow-up. Please try again.');
    }
  } finally {
    setIsFollowUpLoading(false);
  }
};

// NEW: Function to handle follow-up question changes
const handleFollowUpQuestionChange = (index, value) => {
  setFollowUpQuestions(prev => ({
    ...prev,
    [index]: value
  }));
};

// NEW: Function to start follow-up chain
const startFollowUpChain = () => {
  setShowFollowUpInput(false);
  setActiveFollowUpIndex(0);
  setFollowUps([null]); // Add placeholder for first follow-up
};

  const getAgentsByTier = (tier) => {
    return agents.filter(agent => agent.tier === tier);
  };

  const getAgentById = (id) => {
    return agents.find(agent => agent.id === id);
  };

  const renderAgentSelect = (value, onChange, placeholder) => (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <div className="p-2">
          <div className="text-sm font-medium text-muted-foreground mb-2">Free Tier</div>
          {getAgentsByTier('free').map(agent => (
            <SelectItem key={agent.id} value={agent.id} disabled={!agent.enabled}>
              <div className="flex items-center gap-2">
                <Brain className="h-4 w-4" />
                <div>
                  <div className="font-medium">{agent.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {agent.domains.join(', ')}
                  </div>
                </div>
              </div>
            </SelectItem>
          ))}
          <div className="text-sm font-medium text-muted-foreground mb-2 mt-4">Premium Tier (Coming Soon)</div>
          {getAgentsByTier('premium').map(agent => (
            <SelectItem key={agent.id} value={agent.id} disabled={true}>
              <div className="flex items-center gap-2 opacity-50">
                <Brain className="h-4 w-4" />
                <div>
                  <div className="font-medium">{agent.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {agent.domains.join(', ')} • Premium Only
                  </div>
                </div>
              </div>
            </SelectItem>
          ))}
        </div>
      </SelectContent>
    </Select>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <SquareStack className="h-8 w-8 text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Intern Stack</h1>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Compare AI answers side-by-side with cross-assessments.
          </p>
        </div>

        {/* Input Section - Fixed at top */}
        <div className="mb-8">
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm dark:bg-gray-800/80">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Agent Comparison
              </CardTitle>
              <CardDescription>
                Select the interns you want to compare.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Agent Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">First Intern</label>
                  {renderAgentSelect(selectedAgent1, setSelectedAgent1, "Select first intern")}
                  {selectedAgent1 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {getAgentById(selectedAgent1)?.tags.map(tag => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Second Intern</label>
                  {renderAgentSelect(selectedAgent2, setSelectedAgent2, "Select second intern")}
                  {selectedAgent2 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {getAgentById(selectedAgent2)?.tags.map(tag => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Question Input */}
              <div>
                <label className="text-sm font-medium mb-2 block">Your Question</label>
                <Textarea
                  placeholder="Enter your question here..."
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  className="min-h-[100px] resize-none"
                />
              </div>

              {/* Best Practices */}
              <div>
                <label className="text-sm font-medium mb-3 block">Best Practice Add-ons</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {bestPractices.map(practice => (
                    <div key={practice} className="flex items-center space-x-2">
                      <Checkbox
                        id={practice}
                        checked={selectedPractices.includes(practice)}
                        onCheckedChange={() => handlePracticeToggle(practice)}
                      />
                      <label
                        htmlFor={practice}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        {practice}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Error Display */}
              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                  <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                  <span className="text-sm text-red-700 dark:text-red-300">{error}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRetry}
                    className="ml-auto text-red-600 hover:text-red-700 dark:text-red-400"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              )}

              {/* Compare Button */}
              <Button
                onClick={handleCompare}
                disabled={isLoading || !selectedAgent1 || !selectedAgent2 || !question.trim()}
                className="w-full h-12 text-lg font-medium"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Comparing Agents...
                  </>
                ) : (
                  <>
                    <SquareStack className="mr-2 h-5 w-5" />
                    Compare Agents
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Results Section */}
        {results && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Agent 1 Results */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-blue-600" />
                  {results.agent1.name}
                </CardTitle>
                <CardDescription>Original response</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Original Response:</h4>
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-md border border-blue-200 dark:border-blue-800">
                    <p className="text-sm whitespace-pre-wrap">{results.agent1.response}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Agent 2 Results */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-green-600" />
                  {results.agent2.name}
                </CardTitle>
                <CardDescription>Original response</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Original Response:</h4>
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-md border border-green-200 dark:border-green-800">
                    <p className="text-sm whitespace-pre-wrap">{results.agent2.response}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Assessment Section */}
        {results && !assessments && (
          <div className="mt-8">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-purple-600" />
                  Have the interns assess each other for...
                </CardTitle>
                <CardDescription>
                  Select what aspects you want each agent to evaluate in the other's response
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Assessment Criteria Checkboxes */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {ASSESSMENT_CRITERIA.map(criteria => (
                    <div key={criteria} className="flex items-center space-x-2">
                      <Checkbox
                        id={criteria}
                        checked={selectedAssessmentCriteria.includes(criteria)}
                        onCheckedChange={() => handleAssessmentCriteriaToggle(criteria)}
                      />
                      <label
                        htmlFor={criteria}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        {criteria}
                      </label>
                    </div>
                  ))}
                </div>
                
                {/* Go Button */}
                <div className="text-center pt-4">
                  <Button
                    onClick={() => handleGetAssessment(question, results.agent1.response, results.agent2.response)}
                    disabled={isAssessmentLoading || selectedAssessmentCriteria.length === 0}
                    className="h-12 px-8 text-lg font-medium bg-purple-600 hover:bg-purple-700"
                  >
                    <Users className="mr-2 h-5 w-5" />
                    {isAssessmentLoading ? 'Getting Assessments...' : 'Go!'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Assessment Results */}
        {assessments && (
          <div className="mt-8">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Cross-Assessments</h3>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Agent 1 Assessment */}
              <Card className="shadow-lg border-purple-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-purple-600" />
                    {assessments.assessor_info.agent2_name} assesses {assessments.assessor_info.agent1_name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-md border border-purple-200 dark:border-purple-800">
                    <p className="text-sm whitespace-pre-wrap">{assessments.agent1_assessment_by_agent2}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Agent 2 Assessment */}
              <Card className="shadow-lg border-purple-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-purple-600" />
                    {assessments.assessor_info.agent1_name} assesses {assessments.assessor_info.agent2_name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-md border border-purple-200 dark:border-purple-800">
                    <p className="text-sm whitespace-pre-wrap">{assessments.agent2_assessment_by_agent1}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Follow-up Section */}
        {results && activeFollowUpIndex === -1 && ( // Only show if no follow-ups started
          <div className="mt-8">
            <div className="text-center">
              <Button
                onClick={startFollowUpChain} // CHANGED: Use new function
                variant="outline"
                className="h-12 px-8 text-lg font-medium"
              >
                <Brain className="mr-2 h-5 w-5" />
                Ask Follow-up Question
              </Button>
            </div>
          </div>
        )}

        {/* Follow-up Results - Display all follow-ups with input fields */}
        {followUps.map((followUp, index) => (
          <div key={`followup-${index}`} className="mt-8">
            {followUp && ( // CHANGED: Only render if follow-up has results
              <>
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Follow-up {index + 1}</h3>
                  <p className="text-gray-600 dark:text-gray-300">"{followUp.question}"</p>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Agent 1 Follow-up Results */}
                  <Card className="shadow-lg border-blue-200">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Brain className="h-5 w-5 text-blue-600" />
                        {followUp.results.agent1.name} - Follow-up
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2">Follow-up Response:</h4>
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-md border border-blue-200 dark:border-blue-800">
                          <p className="text-sm whitespace-pre-wrap">{followUp.results.agent1.response}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Agent 2 Follow-up Results */}
                  <Card className="shadow-lg border-green-200">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Brain className="h-5 w-5 text-green-600" />
                        {followUp.results.agent2.name} - Follow-up
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2">Follow-up Response:</h4>
                        <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-md border border-green-200 dark:border-green-800">
                          <p className="text-sm whitespace-pre-wrap">{followUp.results.agent2.response}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Assessment and Follow-up buttons */}
                <div className="text-center mt-6 space-y-4">
                  {/* Assessment button for this follow-up */}

                  {!followUpAssessments[index] && (
                    <Card className="shadow-md">
                      <CardHeader className="pb-2">
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <Users className="h-4 w-4 text-purple-600" />
                          Have the interns assess each other for...
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {/* Assessment Criteria Checkboxes */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {ASSESSMENT_CRITERIA.map(criteria => (
                            <div key={criteria} className="flex items-center space-x-2">
                              <Checkbox
                                id={`followup-${index}-${criteria}`}
                                checked={selectedAssessmentCriteria.includes(criteria)}
                                onCheckedChange={() => handleAssessmentCriteriaToggle(criteria)}
                              />
                              <label
                                htmlFor={`followup-${index}-${criteria}`}
                                className="text-xs font-medium leading-none cursor-pointer"
                              >
                                {criteria}
                              </label>
                            </div>
                          ))}
                        </div>
                        
                        {/* Go Button */}
                        <div className="text-center pt-2">
                          <Button
                            onClick={() => handleGetAssessment(
                              followUp.question, 
                              followUp.results.agent1.response, 
                              followUp.results.agent2.response, 
                              true, 
                              index
                            )}
                            disabled={isAssessmentLoading || selectedAssessmentCriteria.length === 0}
                            className="h-10 px-6 text-sm font-medium bg-purple-600 hover:bg-purple-700"
                          >
                            <Users className="mr-2 h-4 w-4" />
                            {isAssessmentLoading ? 'Getting Assessments...' : 'Go!'}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                 )}
                </div>
                
                {/* Follow-up Assessment Results */}
                {followUpAssessments[index] && (
                  <div className="mt-6">
                    <div className="text-center mb-4">
                      <h4 className="text-lg font-bold text-gray-900 dark:text-white">Follow-up Cross-Assessments</h4>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {/* Agent 1 Assessment */}
                      <Card className="shadow-md border-purple-200">
                        <CardHeader className="pb-2">
                          <CardTitle className="flex items-center gap-2 text-sm">
                            <Users className="h-4 w-4 text-purple-600" />
                            {followUpAssessments[index].assessor_info.agent2_name} assesses {followUpAssessments[index].assessor_info.agent1_name}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-md border border-purple-200 dark:border-purple-800">
                            <p className="text-xs whitespace-pre-wrap">{followUpAssessments[index].agent1_assessment_by_agent2}</p>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Agent 2 Assessment */}
                      <Card className="shadow-md border-purple-200">
                        <CardHeader className="pb-2">
                          <CardTitle className="flex items-center gap-2 text-sm">
                            <Users className="h-4 w-4 text-purple-600" />
                            {followUpAssessments[index].assessor_info.agent1_name} assesses {followUpAssessments[index].assessor_info.agent2_name}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-md border border-purple-200 dark:border-purple-800">
                            <p className="text-xs whitespace-pre-wrap">{followUpAssessments[index].agent2_assessment_by_agent1}</p>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                )}
              </>
            )}
            
          </div>
        ))}

{/* ADDED: Single active follow-up input at bottom */}
        {followUps.length > 0 && (
          <div className="mt-8">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  Ask Another Follow-Up Question
                </CardTitle>
                <CardDescription>
                  Continue the conversation with another follow-up question
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Follow-up Question</label>
                  <Textarea
                    placeholder="Ask another follow-up question..."
                    value={followUpQuestions[followUps.length] || ''}
                    onChange={(e) => handleFollowUpQuestionChange(followUps.length, e.target.value)}
                    className="min-h-[80px] resize-none"
                  />
                </div>
                
                <div className="flex gap-3">
                  <Button
                    onClick={() => handleFollowUp(followUps.length)}
                    disabled={isFollowUpLoading || !followUpQuestions[followUps.length]?.trim()}
                    className="flex-1 h-10"
                  >
                    {isFollowUpLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Asking Follow-up...
                      </>
                    ) : (
                      <>
                        <SquareStack className="mr-2 h-4 w-4" />
                        Ask Both Interns
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
    
        {/* Footer */}
        <div className="text-center mt-12 text-sm text-gray-500 dark:text-gray-400">
          <p>Intern Stack MVP - Compare AI agents and make better decisions</p>
          <p className="mt-1">Built with React, Tailwind CSS, and Flask</p>
        </div>
      </div>
    </div>
  );
}

export default App;

