import { NextRequest, NextResponse } from 'next/server';
import { getDb, initDb } from '@/lib/db/init';
import { DbService } from '@/lib/db/service';

export async function GET(request: NextRequest) {
  try {
    const db = await initDb({ env: { DB: request.nextUrl.searchParams.get('_db') } });
    const dbService = new DbService(db);
    
    // Get user ID from auth context or query param (for testing)
    const userId = request.nextUrl.searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }
    
    const projects = await dbService.getProjectsByUserId(userId);
    
    return NextResponse.json(projects);
  } catch (error: any) {
    console.error('Error fetching projects:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const db = await initDb({ env: { DB: request.nextUrl.searchParams.get('_db') } });
    const dbService = new DbService(db);
    
    const body = await request.json();
    const { name, client, userId } = body;
    
    if (!name || !client || !userId) {
      return NextResponse.json({ error: 'Name, client, and userId are required' }, { status: 400 });
    }
    
    // Create the project
    const project = await dbService.createProject({
      name,
      client,
      start_date: new Date().toISOString(),
      status: 'In Progress'
    });
    
    // Add the user as the owner of the project
    await dbService.addUserToProject(userId, project.id, 'owner');
    
    return NextResponse.json(project, { status: 201 });
  } catch (error: any) {
    console.error('Error creating project:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
