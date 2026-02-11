import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

// GET all requirements
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('project_id');

    const db = getDb();

    let query = 'SELECT * FROM requirements';
    const params: string[] = [];

    if (projectId) {
      query += ' WHERE project_id = ?';
      params.push(projectId);
    }

    query += ' ORDER BY created_at DESC';

    const requirements = db.prepare(query).all(...params);
    return NextResponse.json(requirements);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch requirements' },
      { status: 500 }
    );
  }
}

// POST create new requirement
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id, title, description, priority, acceptance_criteria, linked_tasks, project_id, status, notes } = body;

    const db = getDb();
    const newId = id || `req-${Date.now()}`;
    
    // Handle arrays
    const acStr = Array.isArray(acceptance_criteria) 
      ? JSON.stringify(acceptance_criteria) 
      : (acceptance_criteria || '[]');
    const ltStr = Array.isArray(linked_tasks)
      ? JSON.stringify(linked_tasks)
      : (linked_tasks || '[]');

    db.prepare(`
      INSERT INTO requirements (id, title, description, priority, acceptance_criteria, linked_tasks, project_id, status, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      newId, 
      title || 'Untitled', 
      description || '', 
      priority || 'should', 
      acStr, 
      ltStr, 
      project_id || 'proj-drillcore', 
      status || 'draft',
      notes || ''
    );

    return NextResponse.json({ id: newId, ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create requirement' },
      { status: 500 }
    );
  }
}

// PUT update requirement
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, title, description, priority, acceptance_criteria, linked_tasks, status, notes, linked_tasks_completed } = body;

    if (!id) {
      return NextResponse.json({ error: 'Requirement ID required' }, { status: 400 });
    }

    const db = getDb();

    // Fetch existing to preserve fields not being updated
    const existing = db.prepare('SELECT * FROM requirements WHERE id = ?').get(id) as any;
    if (!existing) {
      return NextResponse.json({ error: 'Requirement not found' }, { status: 404 });
    }

    // Handle arrays - preserve existing if not provided
    const acStr = acceptance_criteria !== undefined
      ? (Array.isArray(acceptance_criteria) ? JSON.stringify(acceptance_criteria) : acceptance_criteria)
      : existing.acceptance_criteria;
    
    const ltStr = linked_tasks !== undefined
      ? (Array.isArray(linked_tasks) ? JSON.stringify(linked_tasks) : linked_tasks)
      : existing.linked_tasks;

    // Set archived_at when status changes to 'archived'
    const archivedAt = status === 'archived' 
      ? (existing.archived_at || new Date().toISOString()) 
      : (status === 'draft' || status === 'in-progress' ? null : existing.archived_at);

    // Append notes if provided (for PM progress updates)
    const notesStr = notes !== undefined
      ? (existing.notes ? existing.notes + '\n---\n' + notes : notes)
      : existing.notes;

    db.prepare(`
      UPDATE requirements
      SET title = ?, description = ?, priority = ?, acceptance_criteria = ?, linked_tasks = ?, status = ?, notes = ?, linked_tasks_completed = ?, updated_at = CURRENT_TIMESTAMP, archived_at = ?
      WHERE id = ?
    `).run(
      title !== undefined ? title : existing.title,
      description !== undefined ? description : existing.description,
      priority !== undefined ? priority : existing.priority,
      acStr,
      ltStr,
      status !== undefined ? status : existing.status,
      notesStr,
      linked_tasks_completed !== undefined ? linked_tasks_completed : existing.linked_tasks_completed,
      archivedAt,
      id
    );

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update requirement' },
      { status: 500 }
    );
  }
}

// DELETE requirement
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Requirement ID required' }, { status: 400 });
    }

    const db = getDb();
    db.prepare('DELETE FROM requirements WHERE id = ?').run(id);

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete requirement' },
      { status: 500 }
    );
  }
}
