import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

// GET all milestones
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('project_id');

    const db = getDb();

    let query = 'SELECT * FROM milestones';
    const params: string[] = [];

    if (projectId) {
      query += ' WHERE project_id = ?';
      params.push(projectId);
    }

    query += ' ORDER BY due_date ASC';

    const milestones = db.prepare(query).all(...params);
    return NextResponse.json(milestones);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch milestones' },
      { status: 500 }
    );
  }
}

// POST create new milestone
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id, title, description, due_date, status, progress, project_id } = body;

    const db = getDb();
    const newId = id || `milestone-${Date.now()}`;

    db.prepare(`
      INSERT INTO milestones (id, title, description, due_date, status, progress, project_id)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      newId,
      title || 'Untitled',
      description || '',
      due_date || null,
      status || 'upcoming',
      progress || 0,
      project_id || 'proj-drillcore'
    );

    return NextResponse.json({ id: newId, ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create milestone' },
      { status: 500 }
    );
  }
}

// PUT update milestone
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, title, description, due_date, status, progress } = body;

    const db = getDb();

    db.prepare(`
      UPDATE milestones
      SET title = ?, description = ?, due_date = ?, status = ?, progress = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(title, description, due_date, status, progress, id);

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update milestone' },
      { status: 500 }
    );
  }
}

// DELETE milestone
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Milestone ID required' }, { status: 400 });
    }

    const db = getDb();
    db.prepare('DELETE FROM milestones WHERE id = ?').run(id);

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete milestone' },
      { status: 500 }
    );
  }
}
