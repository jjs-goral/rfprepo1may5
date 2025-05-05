import { NextRequest, NextResponse } from 'next/server';
import { getDb, initDb } from '@/lib/db/init';
import { DbService } from '@/lib/db/service';

export async function GET(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const db = await initDb({ env: { DB: request.nextUrl.searchParams.get('_db') } });
    const dbService = new DbService(db);
    
    const contributors = await dbService.getProjectContributors(params.projectId);
    
    return NextResponse.json(contributors);
  } catch (error: any) {
    console.error('Error fetching project contributors:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const db = await initDb({ env: { DB: request.nextUrl.searchParams.get('_db') } });
    const dbService = new DbService(db);
    
    const body = await request.json();
    const { userId, role } = body;
    
    if (!userId || !role) {
      return NextResponse.json({ error: 'User ID and role are required' }, { status: 400 });
    }
    
    // Add the user to the project with the specified role
    await dbService.addUserToProject(userId, params.projectId, role);
    
    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error: any) {
    console.error('Error adding contributor to project:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
