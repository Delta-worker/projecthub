import { NextResponse } from 'next/server';
import { getDb, seedInitialData } from '@/lib/db';

// GET all tasks
export async function GET() {
  try {
    const db = getDb();
    seedInitialData();
    const tasks = db.prepare('SELECT * FROM tasks ORDER BY created_at DESC').all();
    return NextResponse.json(tasks, {
      headers: {
        'Cache-Control': 'public, s-maxage=10, stale-while-revalidate=30',
      },
    });
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

    // Handle labels - stringify if it's an array
    const labelsStr = Array.isArray(labels) ? JSON.stringify(labels) : (labels || '[]');

    // Check if task exists
    const existing = db.prepare('SELECT id FROM tasks WHERE id = ?').get(id);

    if (existing && id) {
      // Update existing task
      db.prepare(`
        UPDATE tasks
        SET title = ?, description = ?, status = ?, type = ?, priority = ?, labels = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(title, description, status, type, priority, labelsStr, id);
    } else {
      // Create new task (use provided id or generate one)
      const newId = id || `task-${Date.now()}`;
      db.prepare(`
        INSERT INTO tasks (id, title, description, status, type, priority, labels, project_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(newId, title, description, status || 'backlog', type || 'story', priority || 'should', labelsStr, project_id || 'proj-drillcore');
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to save task' },
      { status: 500 }
    );
  }
}

// PUT update task
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, title, description, status, priority, type, labels } = body;
    
    const db = getDb();
    
    // If only status provided (drag-and-drop)
    if (title === undefined && description === undefined && priority === undefined && type === undefined && labels === undefined) {
      db.prepare(`
        UPDATE tasks
        SET status = ?, updated_at = CURRENT_TIMESTAMP, completed_at = ?
        WHERE id = ?
      `).run(status, status === 'done' ? new Date().toISOString() : null, id);
    } else {
      // Full update (editing)
      const labelsStr = labels ? (Array.isArray(labels) ? JSON.stringify(labels) : labels) : undefined;
      db.prepare(`
        UPDATE tasks
        SET title = COALESCE(?, title),
            description = COALESCE(?, description),
            status = COALESCE(?, status),
            type = COALESCE(?, type),
            priority = COALESCE(?, priority),
            labels = COALESCE(?, labels),
            updated_at = CURRENT_TIMESTAMP,
            completed_at = CASE WHEN ? = 'done' THEN CURRENT_TIMESTAMP ELSE completed_at END
        WHERE id = ?
      `).run(title, description, status, type, priority, labelsStr, status, id);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update task' },
      { status: 500 }
    );
  }
}

// DELETE a task
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'Task ID required' },
        { status: 400 }
      );
    }
    
    const db = getDb();
    db.prepare('DELETE FROM tasks WHERE id = ?').run(id);

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete task' },
      { status: 500 }
    );
  }
}
