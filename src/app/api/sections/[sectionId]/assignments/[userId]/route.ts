import { NextRequest, NextResponse } from 'next/server';
import { getDb, initDb } from '@/lib/db/init';
import { DbService } from '@/lib/db/service';

// API route for managing a specific section assignment
export async function GET(
  request: NextRequest,
  { params }: { params: { sectionId: string, userId: string } }
) {
  try {
    const db = await initDb({ env: { DB: request.nextUrl.searchParams.get('_db') } });
    const dbService = new DbService(db);
    
    const assignment = await dbService.getSectionAssignment(params.sectionId, params.userId);
    
    if (!assignment) {
      return NextResponse.json({ error: 'Assignment not found' }, { status: 404 });
    }
    
    return NextResponse.json(assignment);
  } catch (error: any) {
    console.error('Error fetching section assignment:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { sectionId: string, userId: string } }
) {
  try {
    const db = await initDb({ env: { DB: request.nextUrl.searchParams.get('_db') } });
    const dbService = new DbService(db);
    
    const body = await request.json();
    const { content, status } = body;
    
    if (content === undefined && status === undefined) {
      return NextResponse.json({ error: 'Content or status is required' }, { status: 400 });
    }
    
    await dbService.updateSectionAssignment(params.sectionId, params.userId, content, status);
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error updating section assignment:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
