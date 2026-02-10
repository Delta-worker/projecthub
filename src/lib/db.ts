import Database from 'better-sqlite3';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'data', 'projecthub.db');

let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!db) {
    // Ensure data directory exists
    const fs = require('fs');
    const dataDir = path.dirname(DB_PATH);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    initializeDb();
  }
  return db;
}

function initializeDb() {
  const database = getDb();
  
  // Projects table
  database.exec(`
    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      status TEXT DEFAULT 'active',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  // Tasks table
  database.exec(`
    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      status TEXT DEFAULT 'backlog',
      type TEXT DEFAULT 'story',
      priority TEXT DEFAULT 'should',
      assignee TEXT,
      labels TEXT DEFAULT '[]',
      project_id TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      completed_at TEXT,
      FOREIGN KEY (project_id) REFERENCES projects(id)
    )
  `);
  
  // Documents table
  database.exec(`
    CREATE TABLE IF NOT EXISTS documents (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      content TEXT,
      category TEXT DEFAULT 'other',
      project_id TEXT,
      version INTEGER DEFAULT 1,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      created_by TEXT,
      FOREIGN KEY (project_id) REFERENCES projects(id)
    )
  `);
  
  // Requirements table
  database.exec(`
    CREATE TABLE IF NOT EXISTS requirements (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      priority TEXT DEFAULT 'should',
      acceptance_criteria TEXT DEFAULT '[]',
      linked_tasks TEXT DEFAULT '[]',
      project_id TEXT NOT NULL,
      status TEXT DEFAULT 'draft',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (project_id) REFERENCES projects(id)
    )
  `);
  
  // Users table
  database.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE,
      avatar TEXT,
      role TEXT DEFAULT 'viewer',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  // Activity log table
  database.exec(`
    CREATE TABLE IF NOT EXISTS activity (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      message TEXT NOT NULL,
      user_id TEXT,
      project_id TEXT,
      metadata TEXT DEFAULT '{}',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (project_id) REFERENCES projects(id)
    )
  `);
  
  // Create default project if none exists
  const projectCount = database.prepare('SELECT COUNT(*) as count FROM projects').get() as { count: number };
  if (projectCount.count === 0) {
    database.prepare(`
      INSERT INTO projects (id, name, description, status)
      VALUES (?, ?, ?, ?)
    `).run('proj-drillcore', 'DrillCore AI', 'Geological data analysis platform for geologists', 'active');
  }
  
  // Create default user if none exists
  const userCount = database.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
  if (userCount.count === 0) {
    database.prepare(`
      INSERT INTO users (id, name, email, role)
      VALUES (?, ?, ?, ?)
    `).run('user-delta', 'Delta', 'delta@clawd.bot', 'admin');
  }
}

// Seed initial tasks for ProjectHub
export function seedInitialData() {
  const database = getDb();
  
  const taskCount = database.prepare('SELECT COUNT(*) as count FROM tasks').get() as { count: number };
  if (taskCount.count === 0) {
    const tasks = [
      {
        id: 'task-setup',
        title: 'Set up Next.js project with TypeScript and Tailwind',
        description: 'Initialize the project with all required dependencies',
        status: 'done',
        type: 'chore',
        priority: 'must',
        labels: '["infrastructure"]',
        project_id: 'proj-drillcore',
      },
      {
        id: 'task-layout',
        title: 'Create dashboard layout with sidebar navigation',
        description: 'Build the main layout component with navigation',
        status: 'done',
        type: 'story',
        priority: 'must',
        labels: '["frontend", "ui"]',
        project_id: 'proj-drillcore',
      },
      {
        id: 'task-kanban',
        title: 'Implement Kanban board with drag-and-drop',
        description: 'Create the task board with @hello-pangea/dnd',
        status: 'in-progress',
        type: 'story',
        priority: 'must',
        labels: '["frontend", "core-feature"]',
        project_id: 'proj-drillcore',
      },
      {
        id: 'task-database',
        title: 'Set up SQLite database with schema',
        description: 'Create database tables for tasks, documents, and requirements',
        status: 'backlog',
        type: 'chore',
        priority: 'must',
        labels: '["backend", "database"]',
        project_id: 'proj-drillcore',
      },
      {
        id: 'task-docs',
        title: 'Build document repository module',
        description: 'Create document upload, storage, and viewing functionality',
        status: 'backlog',
        type: 'story',
        priority: 'should',
        labels: '["frontend", "backend"]',
        project_id: 'proj-drillcore',
      },
      {
        id: 'task-ai-chat',
        title: 'Implement AI chat interface',
        description: 'Build chat component connected to OpenAI API',
        status: 'backlog',
        type: 'story',
        priority: 'could',
        labels: '["ai", "frontend"]',
        project_id: 'proj-drillcore',
      },
    ];
    
    const insert = database.prepare(`
      INSERT INTO tasks (id, title, description, status, type, priority, labels, project_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    for (const task of tasks) {
      insert.run(
        task.id,
        task.title,
        task.description,
        task.status,
        task.type,
        task.priority,
        task.labels,
        task.project_id
      );
    }
  }
}
