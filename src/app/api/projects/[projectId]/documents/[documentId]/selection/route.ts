import { NextRequest, NextResponse } from 'next/server';
import { getDb, initDb } from '@/lib/db/init';
import { DbService } from '@/lib/db/service';

// API route for updating document selection status for a project
export async function PUT(
  request: NextRequest,
  { params }: { params: { projectId: string, documentId: string } }
) {
  try {
    const db = await initDb({ env: { DB: request.nextUrl.searchParams.get('_db') } });
    const dbService = new DbService(db);
    
    const body = await request.json();
    const { isSelected } = body;
    
    if (isSelected === undefined) {
      return NextResponse.json({ error: 'isSelected field is required' }, { status: 400 });
    }
    
    await dbService.updateDocumentSelection(params.projectId, params.documentId, isSelected);
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error updating document selection:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
