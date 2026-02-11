import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

// PUT /api/feature-requests/archive - Archive a feature request
export async function PUT(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Feature Request ID required' }, { status: 400 });
    }

    const db = getDb();

    // Check if the feature request exists
    const existing = db.prepare('SELECT * FROM requirements WHERE id = ?').get(id);

    if (!existing) {
      return NextResponse.json({ error: 'Feature Request not found' }, { status: 404 });
    }

    // Set status to 'archived' and set archived_at timestamp
    const archivedAt = new Date().toISOString();

    db.prepare(`
      UPDATE requirements
      SET status = 'archived', archived_at = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(archivedAt, id);

    return NextResponse.json({ 
      ok: true, 
      id, 
      status: 'archived',
      archived_at: archivedAt 
    });
  } catch (error) {
    console.error('Archive error:', error);
    return NextResponse.json(
      { error: 'Failed to archive feature request' },
      { status: 500 }
    );
  }
}
