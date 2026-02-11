'use client';

import React, { useState, useEffect, useMemo } from 'react';
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
  Loader2,
  Activity,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface Task {
  id: string;
  title: string;
  status: string;
  created_at: string;
  completed_at: string | null;
}

interface Document {
  id: string;
}

interface Requirement {
  id: string;
}

interface Milestone {
  id: string;
  title: string;
  description: string;
  due_date: string;
  status: string;
  progress: number;
}

interface Activity {
  id: string;
  type: string;
  message: string;
  user: string;
  time: string;
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [taskCount, setTaskCount] = useState(0);
  const [documentCount, setDocumentCount] = useState(0);
  const [requirementCount, setRequirementCount] = useState(0);
  const [tasksByStatus, setTasksByStatus] = useState<{ status: string; count: number; color: string }[]>([]);
  const [recentTasks, setRecentTasks] = useState<Task[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tasksRes, docsRes, reqsRes, milestonesRes] = await Promise.all([
          fetch('/api/tasks'),
          fetch('/api/documents'),
          fetch('/api/requirements'),
          fetch('/api/milestones').catch(() => ({ json: () => [] })),
        ]);

        const tasksData: Task[] = await tasksRes.json();
        const docs: Document[] = await docsRes.json();
        const reqs: Requirement[] = await reqsRes.json();
        const milestonesData: Milestone[] = await milestonesRes.json();

        setTasks(tasksData);
        setTaskCount(tasksData.length);
        setDocumentCount(docs.length);
        setRequirementCount(reqs.length);
        setMilestones(milestonesData);

        // Count tasks by status
        const statusCounts: Record<string, number> = {
          backlog: 0,
          requirements: 0,
          'in-progress': 0,
          development: 0,
          testing: 0,
          done: 0,
        };

        tasksData.forEach((task: Task) => {
          if (statusCounts[task.status] !== undefined) {
            statusCounts[task.status]++;
          } else if (task.status === 'done') {
            statusCounts.done++;
          }
        });

        setTasksByStatus([
          { status: 'Backlog', count: statusCounts.backlog, color: 'bg-slate-500' },
          { status: 'Requirements', count: statusCounts.requirements || 0, color: 'bg-violet-500' },
          { status: 'In Progress', count: statusCounts['in-progress'] || 0, color: 'bg-amber-500' },
          { status: 'Development', count: statusCounts.development || 0, color: 'bg-blue-500' },
          { status: 'Testing', count: statusCounts.testing || 0, color: 'bg-indigo-500' },
          { status: 'Done', count: statusCounts.done, color: 'bg-emerald-500' },
        ]);

        // Get recent tasks (last 5)
        setRecentTasks(tasksData.slice(0, 5));
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Calculate burndown data
  const burndownData = useMemo(() => {
    if (tasks.length === 0) return [];

    // Get all unique dates from created_at
    const dateSet = new Set<string>();
    tasks.forEach((task) => {
      const createdDate = new Date(task.created_at).toISOString().split('T')[0];
      dateSet.add(createdDate);
      if (task.completed_at) {
        const completedDate = new Date(task.completed_at).toISOString().split('T')[0];
        dateSet.add(completedDate);
      }
    });

    const dates = Array.from(dateSet).sort();
    if (dates.length === 0) return [];

    // Get start and end dates
    const startDate = dates[0];
    const endDate = dates[dates.length - 1];

    // Generate all dates in range
    const allDates: string[] = [];
    let currentDate = new Date(startDate);
    while (currentDate <= new Date(endDate)) {
      allDates.push(currentDate.toISOString().split('T')[0]);
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Calculate cumulative added and completed
    const addedByDate: Record<string, number> = {};
    const completedByDate: Record<string, number> = {};

    tasks.forEach((task) => {
      const createdDate = new Date(task.created_at).toISOString().split('T')[0];
      addedByDate[createdDate] = (addedByDate[createdDate] || 0) + 1;

      if (task.completed_at) {
        const completedDate = new Date(task.completed_at).toISOString().split('T')[0];
        completedByDate[completedDate] = (completedByDate[completedDate] || 0) + 1;
      }
    });

    let cumulativeAdded = 0;
    let cumulativeCompleted = 0;

    return allDates.map((date) => {
      cumulativeAdded += addedByDate[date] || 0;
      cumulativeCompleted += completedByDate[date] || 0;

      // Format date for display
      const displayDate = new Date(date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });

      return {
        date: displayDate,
        added: cumulativeAdded,
        completed: cumulativeCompleted,
        remaining: Math.max(0, cumulativeAdded - cumulativeCompleted),
      };
    });
  }, [tasks]);

  // Calculate progress percentage
  const completedCount = tasksByStatus.find(t => t.status === 'Done')?.count || 0;
  const completedPercentage = taskCount > 0 
    ? Math.round((completedCount / taskCount) * 100) 
    : 0;

  const recentActivity: Activity[] = recentTasks.slice(0, 4).map((task, index) => ({
    id: String(index),
    type: 'task_updated',
    message: task.title,
    user: 'Delta',
    time: 'Recently',
  }));

  return (
    <>
      <Header
        title="Dashboard"
        subtitle="ProjectHub - DrillCore AI Development"
      />

      <div className="p-6 space-y-6">
        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Tasks
                  </CardTitle>
                  <div className="p-2 rounded-lg bg-blue-500/10">
                    <Kanban className="h-4 w-4 text-blue-500" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{taskCount}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {completedCount} completed
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Documents
                  </CardTitle>
                  <div className="p-2 rounded-lg bg-violet-500/10">
                    <FileText className="h-4 w-4 text-violet-500" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{documentCount}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Project documents
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Requirements
                  </CardTitle>
                  <div className="p-2 rounded-lg bg-amber-500/10">
                    <Target className="h-4 w-4 text-amber-500" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{requirementCount}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Feature specifications
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Progress
                  </CardTitle>
                  <div className="p-2 rounded-lg bg-emerald-500/10">
                    <TrendingUp className="h-4 w-4 text-emerald-500" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{completedPercentage}%</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Tasks completed
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Burndown Chart */}
            {burndownData.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Task Burndown Chart
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={burndownData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis 
                          dataKey="date" 
                          className="text-xs"
                          tick={{ fontSize: 12 }}
                        />
                        <YAxis 
                          className="text-xs"
                          tick={{ fontSize: 12 }}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px',
                          }}
                        />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="added"
                          name="Tasks Added"
                          stroke="#3b82f6"
                          strokeWidth={2}
                          dot={{ fill: '#3b82f6', strokeWidth: 2 }}
                          activeDot={{ r: 6 }}
                        />
                        <Line
                          type="monotone"
                          dataKey="completed"
                          name="Tasks Completed"
                          stroke="#10b981"
                          strokeWidth={2}
                          dot={{ fill: '#10b981', strokeWidth: 2 }}
                          activeDot={{ r: 6 }}
                        />
                        <Line
                          type="monotone"
                          dataKey="remaining"
                          name="Remaining"
                          stroke="#f59e0b"
                          strokeWidth={2}
                          strokeDasharray="5 5"
                          dot={{ fill: '#f59e0b', strokeWidth: 2 }}
                          activeDot={{ r: 6 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            )}

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
                      <div className="w-28 text-sm text-muted-foreground">
                        {item.status}
                      </div>
                      <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                        <div
                          className={`h-full ${item.color} rounded-full transition-all`}
                          style={{
                            width: `${taskCount > 0 ? (item.count / taskCount) * 100 : 0}%`,
                          }}
                        />
                      </div>
                      <div className="w-8 text-sm font-medium">{item.count}</div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Recent Tasks */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Recent Tasks
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {recentTasks.length > 0 ? (
                    <div className="space-y-4">
                      {recentTasks.map((task, index) => (
                        <div
                          key={task.id}
                          className="flex items-start gap-3 pb-4 border-b last:border-0 last:pb-0"
                        >
                          <div className="mt-1">
                            <CheckCircle className="h-4 w-4 text-emerald-500" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{task.title}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {task.status}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-sm">No tasks yet</p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Milestones */}
            {milestones.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Milestones
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {milestones.map((milestone) => (
                      <div key={milestone.id} className="flex items-center justify-between p-3 bg-accent/50 rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium text-sm">{milestone.title}</h4>
                            <Badge
                              variant={
                                milestone.status === 'completed' ? 'default' :
                                milestone.status === 'in-progress' ? 'secondary' :
                                'outline'
                              }
                            >
                              {milestone.status}
                            </Badge>
                          </div>
                          {milestone.due_date && (
                            <p className="text-xs text-muted-foreground">
                              Due: {new Date(milestone.due_date).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-2 bg-secondary rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary rounded-full"
                              style={{ width: `${milestone.progress}%` }}
                            />
                          </div>
                          <span className="text-xs font-medium">{milestone.progress}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

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
          </>
        )}
      </div>
    </>
  );
}
