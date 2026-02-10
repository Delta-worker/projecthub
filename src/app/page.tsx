'use client';

import React from 'react';
import { Header } from '@/components/layout/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Kanban,
  FileText,
  Target,
  Bot,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';

// Mock data for demonstration
const stats = [
  {
    title: 'Total Tasks',
    value: '24',
    change: '+3 this week',
    icon: Kanban,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
  },
  {
    title: 'Documents',
    value: '12',
    change: '+2 this week',
    icon: FileText,
    color: 'text-violet-500',
    bgColor: 'bg-violet-500/10',
  },
  {
    title: 'Requirements',
    value: '8',
    change: '1 in progress',
    icon: Target,
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10',
  },
  {
    title: 'AI Interactions',
    value: '156',
    change: '+45 this week',
    icon: Bot,
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-500/10',
  },
];

const recentActivity = [
  {
    id: '1',
    type: 'task_completed',
    message: 'Set up Next.js project with TypeScript and Tailwind',
    user: 'Delta',
    time: '2 hours ago',
  },
  {
    id: '2',
    type: 'task_updated',
    message: 'Moved "Implement Kanban board" to In Progress',
    user: 'Delta',
    time: '3 hours ago',
  },
  {
    id: '3',
    type: 'document_created',
    message: 'Created project architecture document',
    user: 'Delta',
    time: '5 hours ago',
  },
  {
    id: '4',
    type: 'requirement_added',
    message: 'Added 3 new requirements for Phase 2',
    user: 'Delta',
    time: '1 day ago',
  },
];

const tasksByStatus = [
  { status: 'Backlog', count: 8, color: 'bg-slate-500' },
  { status: 'Requirements', count: 4, color: 'bg-violet-500' },
  { status: 'Development', count: 6, color: 'bg-amber-500' },
  { status: 'Testing', count: 3, color: 'bg-blue-500' },
  { status: 'Done', count: 3, color: 'bg-emerald-500' },
];

export default function DashboardPage() {
  return (
    <>
      <Header
        title="Dashboard"
        subtitle="ProjectHub - DrillCore AI Development"
      />

      <div className="p-6 space-y-6">
        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                    <Icon className={`h-4 w-4 ${stat.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {stat.change}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Task Progress */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Task Progress
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {tasksByStatus.map((item) => (
                <div key={item.status} className="flex items-center gap-3">
                  <div className="w-24 text-sm text-muted-foreground">
                    {item.status}
                  </div>
                  <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className={`h-full ${item.color} rounded-full transition-all`}
                      style={{
                        width: `${(item.count / 24) * 100}%`,
                      }}
                    />
                  </div>
                  <div className="w-8 text-sm font-medium">{item.count}</div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start gap-3 pb-4 border-b last:border-0 last:pb-0"
                  >
                    <div className="mt-1">
                      {activity.type === 'task_completed' && (
                        <CheckCircle className="h-4 w-4 text-emerald-500" />
                      )}
                      {activity.type === 'task_updated' && (
                        <AlertCircle className="h-4 w-4 text-amber-500" />
                      )}
                      {activity.type === 'document_created' && (
                        <FileText className="h-4 w-4 text-violet-500" />
                      )}
                      {activity.type === 'requirement_added' && (
                        <Target className="h-4 w-4 text-blue-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{activity.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {activity.user} • {activity.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Badge
                variant="secondary"
                className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                + New Task
              </Badge>
              <Badge
                variant="secondary"
                className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                + Upload Document
              </Badge>
              <Badge
                variant="secondary"
                className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                + Add Requirement
              </Badge>
              <Badge
                variant="secondary"
                className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                💬 Ask AI
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
