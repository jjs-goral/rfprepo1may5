import { NextRequest, NextResponse } from 'next/server';
import { getDb, initDb } from '@/lib/db/init';
import { DbService } from '@/lib/db/service';

// API route for managing RFP versions
export async function GET(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const db = await initDb({ env: { DB: request.nextUrl.searchParams.get('_db') } });
    const dbService = new DbService(db);
    
    const versions = await dbService.getRfpVersions(params.projectId);
    
    return NextResponse.json(versions);
  } catch (error: any) {
    console.error('Error fetching RFP versions:', error);
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
    
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'File is required' }, { status: 400 });
    }
    
    // TODO: Implement file upload to Supabase Storage or similar
    // For now, we'll just store metadata
    const filePath = `rfp-versions/${params.projectId}/${Date.now()}_${file.name}`;

    const version = await dbService.createRfpVersion(params.projectId, filePath);
    
    return NextResponse.json(version, { status: 201 });
  } catch (error: any) {
    console.error('Error creating RFP version:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
