import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

// Increase payload limit for file uploads
export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const title = formData.get('title') as string || 'Untitled Document';
    const category = formData.get('category') as string || 'other';
    const projectId = formData.get('project_id') as string || 'proj-drillcore';

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), 'uploads');
    await mkdir(uploadsDir, { recursive: true });

    // Generate unique filename
    const timestamp = Date.now();
    const ext = path.extname(file.name);
    const filename = `${timestamp}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const filepath = path.join(uploadsDir, filename);

    // Write file to disk
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filepath, buffer);

    // Get file content for preview (for text files)
    let content = '';
    const mimeType = file.type;
    
    if (mimeType === 'text/plain' || mimeType === 'text/markdown' || file.name.endsWith('.md')) {
      content = buffer.toString('utf-8');
    } else if (mimeType.startsWith('text/')) {
      content = buffer.toString('utf-8');
    } else {
      // For binary files, create a reference
      content = `# ${title}\n\n**File:** ${file.name}\n**Size:** ${(file.size / 1024).toFixed(2)} KB\n**Type:** ${mimeType}\n\n*This is a binary file. Download it to view.*`;
    }

    // Save to database
    const { getDb } = await import('@/lib/db');
    const db = getDb();
    const newId = `doc-${timestamp}`;

    db.prepare(`
      INSERT INTO documents (id, title, content, category, project_id, created_by, metadata)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      newId,
      title,
      content,
      category,
      projectId,
      'user-delta',
      JSON.stringify({
        filename,
        originalName: file.name,
        size: file.size,
        type: mimeType,
        filepath: `/uploads/${filename}`,
      })
    );

    return NextResponse.json({
      ok: true,
      id: newId,
      filename: `/uploads/${filename}`,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}
