'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Header } from '@/components/layout/Header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bot, Send, User, Sparkles, Loader2, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

// Message type
interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface Task {
  id: string;
  title: string;
  status: string;
  priority: string;
}

interface Document {
  id: string;
  title: string;
  content: string;
  category: string;
}

interface Requirement {
  id: string;
  title: string;
  status: string;
  priority: string;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'msg-1',
      role: 'assistant',
      content: "Hello! I'm your DrillCore AI assistant. I can help you:\n\n• Understand project requirements\n• Track task progress across all stages\n• Find information in your documents\n• Generate project summaries\n\nWhat would you like to know?",
      timestamp: new Date().toISOString(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchProjectData = useCallback(async () => {
    try {
      const [tasksRes, docsRes, reqsRes] = await Promise.all([
        fetch('/api/tasks'),
        fetch('/api/documents'),
        fetch('/api/requirements'),
      ]);
      setTasks(await tasksRes.json());
      setDocuments(await docsRes.json());
      setRequirements(await reqsRes.json());
    } catch (error) {
      console.error('Failed to fetch project data:', error);
    }
  }, []);

  useEffect(() => {
    fetchProjectData();
  }, [fetchProjectData]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const generateResponse = (question: string): string => {
    const q = question.toLowerCase();

    // Task-related queries
    if (q.includes('task') || q.includes('todo')) {
      const backlog = tasks.filter(t => t.status === 'backlog');
      const progress = tasks.filter(t => t.status === 'in-progress');
      const done = tasks.filter(t => t.status === 'done');
      
      return `**Task Overview**\n\n` +
        `• **Backlog:** ${backlog.length} tasks\n` +
        `• **In Progress:** ${progress.length} tasks\n` +
        `• **Done:** ${done.length} tasks\n\n` +
        `**Current Tasks:**\n` +
        progress.map(t => `- ${t.title}`).join('\n') || 'No tasks in progress';
    }

    // Requirements queries
    if (q.includes('requirement') || q.includes('spec')) {
      const must = requirements.filter(r => r.priority === 'must');
      const should = requirements.filter(r => r.priority === 'should');
      
      return `**Requirements Summary**\n\n` +
        `**Must Have (${must.length}):**\n` +
        must.map(r => `- ${r.title}`).join('\n') || 'None\n\n' +
        `**Should Have (${should.length}):**\n` +
        should.map(r => `- ${r.title}`).join('\n') || 'None';
    }

    // Document queries
    if (q.includes('document') || q.includes('doc')) {
      return `**Documents (${documents.length})**\n\n` +
        documents.slice(0, 5).map(d => `- ${d.title}`).join('\n') +
        (documents.length > 5 ? `\n...and ${documents.length - 5} more` : '');
    }

    // Status queries
    if (q.includes('status') || q.includes('progress') || q.includes('how')) {
      const done = tasks.filter(t => t.status === 'done').length;
      const total = tasks.length;
      const pct = total > 0 ? Math.round((done / total) * 100) : 0;
      
      return `**Project Status**\n\n` +
        `**Progress:** ${pct}% complete\n` +
        `**Total Tasks:** ${total}\n` +
        `**Documents:** ${documents.length}\n` +
        `**Requirements:** ${requirements.length}\n\n` +
        `**Quick Stats:**\n` +
        `• ${tasks.filter(t => t.status === 'done').length} tasks completed\n` +
        `• ${tasks.filter(t => t.status === 'in-progress').length} in progress\n` +
        `• ${tasks.filter(t => t.status === 'backlog').length} in backlog`;
    }

    // Summary
    if (q.includes('summary') || q.includes('overview')) {
      return `**DrillCore AI - Project Summary**\n\n` +
        `**Progress:** ${tasks.length > 0 ? Math.round((tasks.filter(t => t.status === 'done').length / tasks.length) * 100) : 0}%\n` +
        `**Tasks:** ${tasks.length} total (${tasks.filter(t => t.status === 'done').length} done)\n` +
        `**Documents:** ${documents.length}\n` +
        `**Requirements:** ${requirements.length}\n\n` +
        `**Recent Activity:**\n` +
        `- ${documents[0]?.title || 'No documents'}\n` +
        `- ${tasks.filter(t => t.status === 'done')[0]?.title || 'No completed tasks'}`;
    }

    return `I understand you're asking about: *"${question}"*\n\n` +
      `I can help with:\n` +
      `• Task status and progress\n` +
      `• Requirements overview\n` +
      `• Document search\n` +
      `• Project summaries\n\n` +
      `Try asking: "Show me tasks" or "What requirements do we have?"`;
  };

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

    // Simulate AI thinking time
    await new Promise(resolve => setTimeout(resolve, 800));

    const response = generateResponse(inputValue);

    const aiMessage: Message = {
      id: `msg-${Date.now() + 1}`,
      role: 'assistant',
      content: response,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, aiMessage]);
    setIsLoading(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const suggestedQuestions = [
    'How is the project progressing?',
    'Show me current tasks',
    'What requirements do we have?',
    'Give me a project summary',
  ];

  const stats = {
    total: tasks.length,
    done: tasks.filter(t => t.status === 'done').length,
    inProgress: tasks.filter(t => t.status === 'in-progress').length,
    backlog: tasks.filter(t => t.status === 'backlog').length,
  };

  return (
    <>
      <Header
        title="AI Chat"
        subtitle="Project-aware AI assistant"
        // Custom action slot
        action={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={fetchProjectData}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Badge variant="outline" className="gap-1">
              <Sparkles className="h-3 w-3" />
              Connected
            </Badge>
          </div>
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
                placeholder="Ask about your project..."
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

        {/* Sidebar */}
        <div className="w-72 border-l p-4 hidden lg:block space-y-4 overflow-y-auto">
          {/* Suggested Questions */}
          <div>
            <h3 className="font-semibold mb-3 text-sm">Suggested Questions</h3>
            <div className="space-y-2">
              {suggestedQuestions.map((q, i) => (
                <button
                  key={i}
                  onClick={() => setInputValue(q)}
                  className="w-full text-left p-2 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors text-sm text-muted-foreground hover:text-foreground"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Stats */}
          <div>
            <h3 className="font-semibold mb-3 text-sm">Quick Stats</h3>
            <Card>
              <CardContent className="p-3 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Tasks</span>
                  <span className="font-medium">{stats.total}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Done</span>
                  <span className="font-medium text-emerald-500">{stats.done}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">In Progress</span>
                  <span className="font-medium text-amber-500">{stats.inProgress}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Backlog</span>
                  <span className="font-medium">{stats.backlog}</span>
                </div>
                <div className="flex justify-between text-sm pt-2 border-t">
                  <span className="text-muted-foreground">Documents</span>
                  <span className="font-medium">{documents.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Requirements</span>
                  <span className="font-medium">{requirements.length}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
