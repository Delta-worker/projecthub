// Task Types
export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  type: TaskType;
  priority: TaskPriority;
  assignee?: string;
  labels: string[];
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  projectId?: string;
}

export type TaskStatus = 'backlog' | 'requirements' | 'development' | 'testing' | 'done';
export type TaskType = 'story' | 'bug' | 'chore' | 'epic';
export type TaskPriority = 'must' | 'should' | 'could' | 'wont';

// Document Types
export interface Document {
  id: string;
  title: string;
  content: string;
  category: DocumentCategory;
  projectId?: string;
  version: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export type DocumentCategory = 'plan' | 'spec' | 'api' | 'guide' | 'other';

// Project Types
export interface Project {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  createdAt: string;
  updatedAt: string;
}

export type ProjectStatus = 'planning' | 'active' | 'completed' | 'on-hold';

// Requirement Types
export interface Requirement {
  id: string;
  title: string;
  description: string;
  priority: TaskPriority;
  acceptanceCriteria: string[];
  linkedTasks: string[];
  projectId: string;
  status: RequirementStatus;
  createdAt: string;
  updatedAt: string;
}

export type RequirementStatus = 'draft' | 'approved' | 'in-progress' | 'completed' | 'rejected';

// User Types
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: UserRole;
}

export type UserRole = 'admin' | 'member' | 'viewer';

// Activity Types
export interface Activity {
  id: string;
  type: ActivityType;
  message: string;
  userId: string;
  projectId: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export type ActivityType = 
  | 'task_created' 
  | 'task_updated' 
  | 'task_completed'
  | 'task_moved'
  | 'document_created'
  | 'document_updated'
  | 'requirement_created'
  | 'comment_added';

// Kanban Board Types
export interface Board {
  columns: Column[];
}

export interface Column {
  id: TaskStatus;
  title: string;
  tasks: Task[];
}
