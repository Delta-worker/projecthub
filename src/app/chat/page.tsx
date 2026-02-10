'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bot, Send, User, Sparkles, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

// Message type
interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

const initialMessages: Message[] = [
  {
    id: 'msg-1',
    role: 'assistant',
    content:
      "Hello! I'm your AI project assistant. I can help you with:\n\n• Understanding project requirements and specifications\n• Finding information in your documents\n• Tracking task progress and dependencies\n• Generating reports and summaries\n• Suggesting next steps for development\n\nWhat would you like to know about the DrillCore AI project?",
    timestamp: '2026-02-10T09:00:00Z',
  },
];

const suggestedQuestions = [
  "What's the current project status?",
  'Show me the top priority requirements',
  'What tasks are in development?',
  'Generate a project summary',
];

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: inputValue,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    // Simulate AI response (in production, this would call OpenAI API)
    setTimeout(() => {
      const responses: Record<string, string> = {
        "what's the current project status?":
          "**DrillCore AI Project Status** (Updated: Today)\n\n**Phase:** Development (Phase 1 of 2)\n\n**Completed:**\n- ✅ Project architecture defined\n- ✅ Tech stack selected (Next.js, TypeScript, Tailwind)\n- ✅ Dashboard layout created\n- ✅ Kanban board structure implemented\n\n**In Progress:**\n- 🔄 Kanban drag-and-drop functionality\n- 🔄 SQLite database integration\n\n**Next Steps:**\n1. Complete drag-and-drop implementation\n2. Build document repository module\n3. Implement AI chat integration",
        'show me the top priority requirements':
          "**Top Priority Requirements (Must Have)**\n\n1. **CSV File Upload and Parsing** ✅ Completed\n   - Drag-and-drop upload\n   - Automatic column detection\n   - Drillhole data validation\n\n2. **Interactive Data Visualizations** 🔄 In Progress\n   - Histograms for numerical data\n   - Scatter plots (grade vs depth)\n   - Cross-section views\n\n3. **AI-Powered Data Exploration** 📋 Approved\n   - Natural language chat\n   - Context-aware responses\n   - Chart generation from text",
        'what tasks are in development?':
          "**Tasks Currently in Development**\n\n1. **Implement Kanban board with drag-and-drop**\n   - Using @hello-pangea/dnd library\n   - Expected completion: Today\n\n2. **Build task CRUD API endpoints**\n   - REST API for task management\n   - Database integration\n   - Status: Started",
        'generate a project summary':
          "**DrillCore AI - Project Summary**\n\n**Objective:** Build a cloud-native platform for geologists to analyze drillhole CSV data with AI-powered insights.\n\n**Timeline:** 2 weeks (Phase 1)\n**Progress:** 40% complete\n\n**Key Accomplishments:**\n- Full project plan created\n- Next.js project initialized\n- Dashboard layout implemented\n- Kanban board structure ready\n\n**Remaining Work:**\n- Complete drag-and-drop\n- Database integration\n- Document repository\n- AI chat interface\n\n**Risks:** None identified",
      };

      const key = inputValue.toLowerCase();
      let response =
        responses[
          Object.keys(responses).find((k) => key.includes(k)) || ''
        ] ||
        "I understand you're asking about: *" +
          inputValue +
          "*\n\nI'm your AI project assistant. I can help you:\n\n• Understand project requirements\n• Find information in documents\n• Track task progress\n• Generate reports\n\nCould you be more specific about what you'd like to know?";

      const aiMessage: Message = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        content: response,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, aiMessage]);
      setIsLoading(false);
    }, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      <Header
        title="AI Chat"
        subtitle="Project-aware AI assistant"
        // @ts-expect-error - Custom action slot
        action={
          <Badge variant="outline" className="gap-1">
            <Sparkles className="h-3 w-3" />
            GPT-4 Powered
          </Badge>
        }
      />

      <div className="flex h-[calc(100vh-4rem)]">
        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  'flex gap-3',
                  message.role === 'user' && 'flex-row-reverse'
                )}
              >
                <div
                  className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center shrink-0',
                    message.role === 'assistant'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-secondary-foreground'
                  )}
                >
                  {message.role === 'assistant' ? (
                    <Bot className="h-4 w-4" />
                  ) : (
                    <User className="h-4 w-4" />
                  )}
                </div>
                <div
                  className={cn(
                    'max-w-[70%] rounded-lg px-4 py-2',
                    message.role === 'assistant'
                      ? 'bg-card border'
                      : 'bg-primary text-primary-foreground'
                  )}
                >
                  <div className="whitespace-pre-wrap text-sm">
                    {message.content}
                  </div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="bg-card border rounded-lg px-4 py-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t bg-background">
            <div className="flex gap-2">
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about the project..."
                className="flex-1 min-h-[44px] max-h-32 resize-none rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                rows={1}
              />
              <Button
                onClick={handleSend}
                disabled={!inputValue.trim() || isLoading}
                size="icon"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Sidebar - Suggested Questions */}
        <div className="w-72 border-l p-4 hidden lg:block">
          <h3 className="font-semibold mb-3 text-sm">Suggested Questions</h3>
          <div className="space-y-2">
            {suggestedQuestions.map((question, i) => (
              <button
                key={i}
                onClick={() => setInputValue(question)}
                className="w-full text-left p-2 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors text-sm text-muted-foreground hover:text-foreground"
              >
                {question}
              </button>
            ))}
          </div>

          <h3 className="font-semibold mt-6 mb-3 text-sm">Quick Stats</h3>
          <Card>
            <CardContent className="p-3 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tasks Completed</span>
                <span className="font-medium">3</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">In Progress</span>
                <span className="font-medium">2</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Messages</span>
                <span className="font-medium">{messages.length}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
