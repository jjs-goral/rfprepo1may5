import { NextRequest, NextResponse } from 'next/server';
import { getDb, initDb } from '@/lib/db/init';
import { DbService } from '@/lib/db/service';

// API route for managing agency-wide documents
export async function GET(request: NextRequest) {
  try {
    const db = await initDb({ env: { DB: request.nextUrl.searchParams.get('_db') } });
    const dbService = new DbService(db);
    
    // Get user ID from auth context or query param (for testing)
    const userId = request.nextUrl.searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }
    
    const documents = await dbService.getAgencyDocuments(userId);
    
    return NextResponse.json(documents);
  } catch (error: any) {
    console.error('Error fetching agency documents:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const db = await initDb({ env: { DB: request.nextUrl.searchParams.get('_db') } });
    const dbService = new DbService(db);
    
    const formData = await request.formData();
    const name = formData.get('name') as string;
    const file = formData.get('file') as File;
    const userId = formData.get('userId') as string;
    
    if (!name || !file || !userId) {
      return NextResponse.json({ error: 'Name, file, and userId are required' }, { status: 400 });
    }
    
    // TODO: Implement file upload to Supabase Storage or similar
    // For now, we'll just store metadata
    const filePath = `agency-docs/${userId}/${file.name}`;
    const fileSize = file.size;
    const fileType = file.type.split('/').pop() || '';

    const document = await dbService.createDocument({
      name,
      file_type: fileType,
      file_path: filePath,
      file_size: fileSize,
      user_id: userId,
      is_agency_doc: true,
    });
    
    return NextResponse.json(document, { status: 201 });
  } catch (error: any) {
    console.error('Error uploading agency document:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
