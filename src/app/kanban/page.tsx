'use client';

import React, { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn, getPriorityIcon, getTypeIcon } from '@/lib/utils';
import {
  Plus,
  MoreHorizontal,
  GripVertical,
  Search,
  Filter,
} from 'lucide-react';

// Task type definition
interface Task {
  id: string;
  title: string;
  description?: string;
  status: string;
  type: string;
  priority: string;
  labels: string[];
}

// Column type
interface Column {
  id: string;
  title: string;
  tasks: Task[];
}

// Initial mock data
const initialColumns: Column[] = [
  {
    id: 'backlog',
    title: 'Backlog',
    tasks: [
      {
        id: 'task-database',
        title: 'Set up SQLite database with schema',
        description: 'Create database tables for tasks, documents, and requirements',
        status: 'backlog',
        type: 'chore',
        priority: 'must',
        labels: ['backend', 'database'],
      },
      {
        id: 'task-docs-repo',
        title: 'Build document repository module',
        description: 'Create document upload, storage, and viewing functionality',
        status: 'backlog',
        type: 'story',
        priority: 'should',
        labels: ['frontend', 'backend'],
      },
      {
        id: 'task-auth',
        title: 'Implement user authentication',
        description: 'Add login, registration, and session management',
        status: 'backlog',
        type: 'chore',
        priority: 'could',
        labels: ['security'],
      },
    ],
  },
  {
    id: 'requirements',
    title: 'Requirements',
    tasks: [
      {
        id: 'task-req-1',
        title: 'Define user story format',
        description: 'Create template for user stories with acceptance criteria',
        status: 'requirements',
        type: 'story',
        priority: 'must',
        labels: ['documentation'],
      },
    ],
  },
  {
    id: 'development',
    title: 'Development',
    tasks: [
      {
        id: 'task-kanban',
        title: 'Implement Kanban board with drag-and-drop',
        description: 'Create the task board with @hello-pangea/dnd',
        status: 'development',
        type: 'story',
        priority: 'must',
        labels: ['frontend', 'core-feature'],
      },
      {
        id: 'task-api-tasks',
        title: 'Build task CRUD API endpoints',
        description: 'Create REST API for task management',
        status: 'development',
        type: 'story',
        priority: 'should',
        labels: ['backend', 'api'],
      },
    ],
  },
  {
    id: 'testing',
    title: 'Testing',
    tasks: [
      {
        id: 'task-tests-1',
        title: 'Write unit tests for components',
        description: 'Add Jest tests for React components',
        status: 'testing',
        type: 'chore',
        priority: 'should',
        labels: ['testing'],
      },
    ],
  },
  {
    id: 'done',
    title: 'Done',
    tasks: [
      {
        id: 'task-setup',
        title: 'Set up Next.js project with TypeScript and Tailwind',
        description: 'Initialize the project with all required dependencies',
        status: 'done',
        type: 'chore',
        priority: 'must',
        labels: ['infrastructure'],
      },
      {
        id: 'task-layout',
        title: 'Create dashboard layout with sidebar navigation',
        description: 'Build the main layout component with navigation',
        status: 'done',
        type: 'story',
        priority: 'must',
        labels: ['frontend', 'ui'],
      },
    ],
  },
];

export default function KanbanPage() {
  const [columns, setColumns] = useState<Column[]>(initialColumns);
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);

  const handleDragStart = (task: Task, columnId: string) => {
    setDraggedTask(task);
  };

  const handleDragOver = (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    setDragOverColumn(columnId);
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  const handleDrop = (e: React.DragEvent, targetColumnId: string) => {
    e.preventDefault();
    setDragOverColumn(null);

    if (!draggedTask) return;

    // Move task to new column
    const newColumns = columns.map((col) => {
      // Remove task from original column
      if (col.tasks.some((t) => t.id === draggedTask.id)) {
        return {
          ...col,
          tasks: col.tasks.filter((t) => t.id !== draggedTask.id),
        };
      }
      return col;
    });

    // Add task to target column
    const updatedTask = { ...draggedTask, status: targetColumnId };
    setColumns(
      newColumns.map((col) =>
        col.id === targetColumnId
          ? { ...col, tasks: [...col.tasks, updatedTask] }
          : col
      )
    );

    setDraggedTask(null);
  };

  return (
    <>
      <Header
        title="Kanban Board"
        subtitle="Manage tasks and track progress"
        // @ts-expect-error - Custom action slot
        action={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              New Task
            </Button>
          </div>
        }
      />

      <div className="p-6 overflow-x-auto">
        <div className="flex gap-4 min-w-max">
          {columns.map((column) => (
            <div
              key={column.id}
              className={cn(
                'w-72 flex-shrink-0 rounded-lg transition-colors',
                dragOverColumn === column.id && 'bg-accent/50'
              )}
              onDragOver={(e) => handleDragOver(e, column.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, column.id)}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between p-3 bg-card rounded-t-lg border-b">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-sm">{column.title}</h3>
                  <Badge variant="secondary" className="text-xs">
                    {column.tasks.length}
                  </Badge>
                </div>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>

              {/* Tasks */}
              <div className="p-2 space-y-2 bg-card/50 rounded-b-lg min-h-[200px]">
                {column.tasks.map((task) => (
                  <Card
                    key={task.id}
                    draggable
                    onDragStart={() => handleDragStart(task, column.id)}
                    className={cn(
                      'p-3 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow',
                      draggedTask?.id === task.id && 'opacity-50'
                    )}
                  >
                    {/* Task Header */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-1">
                        <GripVertical className="h-4 w-4 text-muted-foreground" />
                        <span className="text-xs">
                          {getTypeIcon(task.type)}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {getPriorityIcon(task.priority)}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5"
                      >
                        <MoreHorizontal className="h-3 w-3" />
                      </Button>
                    </div>

                    {/* Task Title */}
                    <h4 className="text-sm font-medium mb-1">{task.title}</h4>

                    {/* Task Description */}
                    {task.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                        {task.description}
                      </p>
                    )}

                    {/* Labels */}
                    <div className="flex flex-wrap gap-1">
                      {task.labels.map((label) => (
                        <Badge
                          key={label}
                          variant="outline"
                          className="text-[10px] px-1.5 py-0"
                        >
                          {label}
                        </Badge>
                      ))}
                    </div>
                  </Card>
                ))}

                {/* Add Task Button */}
                <Button
                  variant="ghost"
                  className="w-full text-muted-foreground hover:text-foreground"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add task
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
