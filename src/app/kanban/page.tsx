'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Header } from '@/components/layout/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn, getPriorityIcon, getTypeIcon } from '@/lib/utils';
import {
  Plus,
  GripVertical,
  X,
  Pencil,
  RefreshCw,
  MoreHorizontal,
} from 'lucide-react';
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
  DroppableProvided,
  DraggableProvided,
  DraggableStateSnapshot,
} from '@hello-pangea/dnd';

// Task type definition
interface Task {
  id: string;
  title: string;
  description?: string;
  status: string;
  type: string;
  priority: string;
  labels: string[];
  assignee?: string;
}

// User type for assignee dropdown
interface User {
  id: string;
  name: string;
  avatar?: string;
}

// Column type
interface Column {
  id: string;
  title: string;
  tasks: Task[];
}

const COLUMN_ORDER = ['backlog', 'in-progress', 'development', 'testing', 'in-review', 'done'];

const STATUS_LABELS: Record<string, string> = {
  backlog: 'Backlog',
  requirements: 'Requirements',
  'in-progress': 'In Progress',
  development: 'Development',
  testing: 'Testing',
  'in-review': 'In Review',
  done: 'Done',
};

export default function KanbanPage() {
  const [columns, setColumns] = useState<Column[]>([]);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);

  // Create task state
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newPriority, setNewPriority] = useState('should');
  const [newAssignee, setNewAssignee] = useState('user-delta');

  // Edit task state
  const [isEditing, setIsEditing] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editPriority, setEditPriority] = useState('should');
  const [editAssignee, setEditAssignee] = useState('');

  // Search and filter state
  // Create new task
  const handleCreateTask = async () => {
    if (!newTitle.trim()) return;

    try {
      await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle,
          description: newDescription,
          status: 'backlog',
          type: 'story',
          priority: newPriority,
          labels: [],
          assignee: newAssignee || null,
        }),
      });
      setIsCreating(false);
      setNewTitle('');
      setNewDescription('');
      setNewAssignee('');
      fetchTasks();
    } catch (error) {
      console.error('Failed to create task:', error);
    }
  };

  // Edit task handlers
  const startEditTask = (task: Task) => {
    setEditingTask(task);
    setEditTitle(task.title);
    setEditDescription(task.description || '');
    setEditPriority(task.priority);
    setEditAssignee(task.assignee || '');
    setIsEditing(true);
  };

  const handleEditTask = async () => {
    if (!editingTask || !editTitle.trim()) return;

    try {
      await fetch('/api/tasks', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingTask.id,
          title: editTitle,
          description: editDescription,
          priority: editPriority,
          assignee: editAssignee || null,
        }),
      });
      setIsEditing(false);
      setEditingTask(null);
      fetchTasks();
    } catch (error) {
      console.error('Failed to edit task:', error);
    }
  };

  const handleDeleteTask = async (id: string) => {
    if (!confirm('Delete this task?')) return;

    try {
      await fetch(`/api/tasks?id=${id}`, { method: 'DELETE' });
      setIsEditing(false);
      setEditingTask(null);
      fetchTasks();
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  };

  // Fetch tasks from API
  const fetchTasks = async () => {
    try {
      const res = await fetch('/api/tasks');
      const tasks: Task[] = await res.json();

      // Group tasks by status
      const grouped: Record<string, Task[]> = {};
      COLUMN_ORDER.forEach((status) => {
        grouped[status] = [];
      });

      // Group all tasks by status
      tasks.forEach((t) => {
        if (grouped[t.status]) {
          grouped[t.status].push(t);
        }
      });

      // All columns visible
      const columnData: Column[] = COLUMN_ORDER.map((status) => ({
        id: status,
        title: STATUS_LABELS[status] || status,
        tasks: grouped[status] || [],
      }));
      
      setColumns(columnData);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
    // Note: Users table exists but API not implemented yet
    // For now, use default users
    setUsers([
      { id: 'user-delta', name: 'Delta' },
      { id: 'user-anthony', name: 'Anthony' },
    ]);
  }, []);

  const handleDragEnd = useCallback(async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    // Dropped outside or same position
    if (!destination) return;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const sourceColumn = columns.find((col) => col.id === source.droppableId);
    const destColumn = columns.find((col) => col.id === destination.droppableId);

    if (!sourceColumn || !destColumn) return;

    const task = sourceColumn.tasks[source.index];

    // Optimistic update
    setColumns((prev) => {
      const newColumns = prev.map((col) => {
        if (col.id === source.droppableId) {
          return {
            ...col,
            tasks: col.tasks.filter((t) => t.id !== draggableId),
          };
        }
        if (col.id === destination.droppableId) {
          const newTasks = [...col.tasks];
          newTasks.splice(destination.index, 0, { ...task, status: destination.droppableId });
          return { ...col, tasks: newTasks };
        }
        return col;
      });
      return newColumns;
    });

    // Update via API
    try {
      await fetch('/api/tasks', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: draggableId, status: destination.droppableId }),
      });
    } catch (error) {
      console.error('Failed to update task:', error);
      // Revert on error
      fetchTasks();
    }
  }, [columns]);

  if (loading) {
    return (
      <>
        <Header title="Kanban Board" subtitle="Loading..." />
        <div className="p-6 flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </>
    );
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Header
        title="Kanban Board"
        subtitle="Manage tasks and track progress"
        action={
          <Button size="sm" onClick={() => setIsCreating(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Task
          </Button>
        }
      />

      {/* Create Task Modal */}
      {isCreating && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Create New Task</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Title</label>
                <Input
                  value={newTitle}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewTitle(e.target.value)}
                  placeholder="Task title"
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  value={newDescription}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNewDescription(e.target.value)}
                  placeholder="Task description"
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Priority</label>
                <div className="flex gap-2 mt-1">
                  {['must', 'should', 'could'].map((p) => (
                    <Button
                      key={p}
                      variant={newPriority === p ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setNewPriority(p)}
                    >
                      {p.charAt(0).toUpperCase() + p.slice(1)}
                    </Button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Assignee</label>
                <select
                  value={newAssignee}
                  onChange={(e) => setNewAssignee(e.target.value)}
                  className="w-full mt-1 h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
                >
                  <option value="">Unassigned</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsCreating(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateTask}>Create Task</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Edit Task Modal */}
      {isEditing && editingTask && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Edit Task</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Title</label>
                <Input
                  value={editTitle}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditTitle(e.target.value)}
                  placeholder="Task title"
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  value={editDescription}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setEditDescription(e.target.value)}
                  placeholder="Task description"
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Priority</label>
                <div className="flex gap-2 mt-1">
                  {['must', 'should', 'could'].map((p) => (
                    <Button
                      key={p}
                      variant={editPriority === p ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setEditPriority(p)}
                    >
                      {p.charAt(0).toUpperCase() + p.slice(1)}
                    </Button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Assignee</label>
                <select
                  value={editAssignee}
                  onChange={(e) => setEditAssignee(e.target.value)}
                  className="w-full mt-1 h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
                >
                  <option value="">Unassigned</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => handleDeleteTask(editingTask.id)} className="text-destructive">
                  Delete
                </Button>
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
                <Button onClick={handleEditTask}>Save Changes</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="p-6 overflow-x-auto">
        <div className="flex gap-4 min-w-max">
          {columns.map((column) => (
            <Droppable key={column.id} droppableId={column.id}>
              {(provided: DroppableProvided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={cn(
                    'w-72 flex-shrink-0 rounded-lg transition-colors'
                  )}
                >
                  {/* Column Header */}
                  <div className="flex items-center justify-between p-3 bg-card rounded-t-lg border-b">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-sm">{column.title}</h3>
                      <Badge variant="secondary" className="text-xs">
                        {column.tasks.length}
                      </Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => {
                        setNewTitle('');
                        setNewDescription('');
                        setNewPriority('should');
                        setNewAssignee('user-delta');
                        setIsCreating(true);
                      }}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Tasks */}
                  <div className="p-2 space-y-2 bg-card/50 rounded-b-lg min-h-[200px]">
                    {column.tasks.map((task, index) => (
                      <Draggable
                        key={task.id}
                        draggableId={task.id}
                        index={index}
                      >
                        {(
                          provided: DraggableProvided,
                          snapshot: DraggableStateSnapshot
                        ) => (
                          <Card
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={cn(
                              'p-3 hover:shadow-md transition-shadow',
                              snapshot.isDragging && 'shadow-lg ring-2 ring-primary'
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
                                onClick={() => startEditTask(task)}
                              >
                                <Pencil className="h-3 w-3" />
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
                            {task.labels && task.labels.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {Array.isArray(task.labels) ? task.labels.map((label: string) => (
                                  <Badge
                                    key={label}
                                    variant="outline"
                                    className="text-[10px] px-1.5 py-0"
                                  >
                                    {label}
                                  </Badge>
                                )) : null}
                              </div>
                            )}

                            {/* Assignee */}
                            {task.assignee && (
                              <div className="flex items-center gap-1 mt-2 pt-2 border-t">
                                <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center">
                                  <span className="text-[10px] font-medium">
                                    {users.find(u => u.id === task.assignee)?.name?.charAt(0) || '?'}
                                  </span>
                                </div>
                                <span className="text-[10px] text-muted-foreground">
                                  {users.find(u => u.id === task.assignee)?.name || 'Unknown'}
                                </span>
                              </div>
                            )}
                          </Card>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}

                    {/* Add Task Button */}
                    <Button
                      variant="ghost"
                      className="w-full text-muted-foreground hover:text-foreground"
                      onClick={() => setIsCreating(true)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add task
                    </Button>
                  </div>
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </div>
    </DragDropContext>
  );
}
