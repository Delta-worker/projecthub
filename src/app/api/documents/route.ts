import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

// GET all documents
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('project_id');

    const db = getDb();

    let query = 'SELECT * FROM documents';
    const params: string[] = [];

    if (projectId) {
      query += ' WHERE project_id = ?';
      params.push(projectId);
    }

    query += ' ORDER BY updated_at DESC';

    const documents = db.prepare(query).all(...params);
    return NextResponse.json(documents, {
      headers: {
        'Cache-Control': 'public, s-maxage=10, stale-while-revalidate=30',
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch documents' },
      { status: 500 }
    );
  }
}

// POST create new document
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id, title, content, category, project_id, created_by } = body;

    const db = getDb();
    const newId = id || `doc-${Date.now()}`;

    db.prepare(`
      INSERT INTO documents (id, title, content, category, project_id, created_by)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(newId, title || 'Untitled', content || '', category || 'other', project_id || 'proj-drillcore', created_by || 'user-delta');

    return NextResponse.json({ id: newId, ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create document' },
      { status: 500 }
    );
  }
}

// PUT update document
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, title, content, category } = body;

    const db = getDb();

    db.prepare(`
      UPDATE documents
      SET title = ?, content = ?, category = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(title, content, category, id);

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update document' },
      { status: 500 }
    );
  }
}

// DELETE document
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Document ID required' }, { status: 400 });
    }

    const db = getDb();
    db.prepare('DELETE FROM documents WHERE id = ?').run(id);

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete document' },
      { status: 500 }
    );
  }
}
