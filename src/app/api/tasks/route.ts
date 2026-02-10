import { NextResponse } from 'next/server';
import { getDb, seedInitialData } from '@/lib/db';

// GET all tasks
export async function GET() {
  try {
    const db = getDb();
    seedInitialData();
    const tasks = db.prepare('SELECT * FROM tasks ORDER BY created_at DESC').all();
    return NextResponse.json(tasks);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch tasks' },
      { status: 500 }
    );
  }
}

// POST create/update task
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const db = getDb();

    const { id, title, description, status, type, priority, labels, project_id } = body;

    if (id) {
      // Update existing task
      db.prepare(`
        UPDATE tasks
        SET title = ?, description = ?, status = ?, type = ?, priority = ?, labels = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(title, description, status, type, priority, JSON.stringify(labels), id);
    } else {
      // Create new task
      const newId = `task-${Date.now()}`;
      db.prepare(`
        INSERT INTO tasks (id, title, description, status, type, priority, labels, project_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(newId, title, description, status || 'backlog', type || 'story', priority || 'should', JSON.stringify(labels), project_id || 'proj-drillcore');
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to save task' },
      { status: 500 }
    );
  }
}

// PUT update task status (for drag-and-drop)
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, status } = body;
    
    const db = getDb();
    db.prepare(`
      UPDATE tasks
      SET status = ?, updated_at = CURRENT_TIMESTAMP, completed_at = ?
      WHERE id = ?
    `).run(status, status === 'done' ? new Date().toISOString() : null, id);

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update task' },
      { status: 500 }
    );
  }
}
