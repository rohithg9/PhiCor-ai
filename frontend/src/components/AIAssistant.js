import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { Send, Loader2, Bot, User, Sparkles } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';
import { useAuth } from '../context/AuthContext';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AIAssistant = ({ physiologicalState, selectedSystem, simulationResults }) => {
  const { isAuthenticated } = useAuth();
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hello! I'm your physiological modeling assistant. Ask me about equations, drug mechanisms, simulation results, or any aspect of the mathematical models. How can I help you today?"
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([
    "Explain the Frank-Starling mechanism",
    "How does paracetamol affect temperature?",
    "What does a low GFR indicate?"
  ]);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async (messageText = input) => {
    if (!messageText.trim()) return;

    const userMessage = { role: 'user', content: messageText };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await axios.post(`${API}/chat`, {
        message: messageText,
        context: {
          selectedSystem,
          physiologicalState,
          simulationResults: simulationResults ? {
            drug: simulationResults.drug,
            changes: simulationResults.attributions?.length
          } : null
        }
      });

      const assistantMessage = {
        role: 'assistant',
        content: response.data.response
      };

      setMessages(prev => [...prev, assistantMessage]);
      
      if (response.data.suggestions?.length > 0) {
        setSuggestions(response.data.suggestions);
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "I apologize, but I encountered an error. Please try again or rephrase your question."
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleSuggestionClick = (suggestion) => {
    sendMessage(suggestion);
  };

  if (!isAuthenticated) {
    return (
      <div className="h-full flex items-center justify-center text-center">
        <div>
          <Bot className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground mb-4">Sign in to access AI assistance</p>
          <Button onClick={() => window.location.href = '/auth'}>
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Messages */}
      <ScrollArea className="flex-1 pr-4" ref={scrollRef}>
        <div className="space-y-4 py-4">
          {messages.map((message, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                message.role === 'user' 
                  ? 'bg-primary/20' 
                  : 'bg-white/10'
              }`}>
                {message.role === 'user' ? (
                  <User className="w-4 h-4 text-primary" />
                ) : (
                  <Bot className="w-4 h-4 text-muted-foreground" />
                )}
              </div>
              <div className={`flex-1 p-3 rounded-lg text-sm ${
                message.role === 'user'
                  ? 'bg-primary/10 text-foreground'
                  : 'bg-white/5 text-foreground'
              }`}>
                <p className="whitespace-pre-wrap">{message.content}</p>
              </div>
            </motion.div>
          ))}
          
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-3"
            >
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
              </div>
              <div className="flex-1 p-3 rounded-lg bg-white/5">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>Thinking</span>
                  <span className="flex gap-1">
                    <span className="w-1 h-1 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1 h-1 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1 h-1 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '300ms' }} />
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </ScrollArea>

      {/* Suggestions */}
      <div className="py-2 border-t border-white/10">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-3 h-3 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">Suggestions</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {suggestions.map((suggestion, i) => (
            <button
              key={i}
              onClick={() => handleSuggestionClick(suggestion)}
              className="px-3 py-1.5 rounded-full text-xs bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors"
              data-testid={`ai-suggestion-${i}`}
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="flex gap-2 pt-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ask about equations, drugs, or physiology..."
          className="flex-1"
          disabled={loading}
          data-testid="ai-input"
        />
        <Button
          onClick={() => sendMessage()}
          disabled={loading || !input.trim()}
          className="glow-primary"
          data-testid="ai-send-btn"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </Button>
      </div>
    </div>
  );
};

export default AIAssistant;
