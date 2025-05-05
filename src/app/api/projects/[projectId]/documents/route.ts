import { NextRequest, NextResponse } from 'next/server';
import { getDb, initDb } from '@/lib/db/init';
import { DbService } from '@/lib/db/service';
import { ProjectDocument } from '@/lib/db/types';

// API route for managing project-specific documents
export async function GET(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const db = await initDb({ env: { DB: request.nextUrl.searchParams.get('_db') } });
    const dbService = new DbService(db);
    
    const documentType = request.nextUrl.searchParams.get('type') as ProjectDocument['document_type'] | null;
    
    const documents = await dbService.getProjectDocuments(params.projectId, documentType || undefined);
    
    return NextResponse.json(documents);
  } catch (error: any) {
    console.error('Error fetching project documents:', error);
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
    const name = formData.get('name') as string;
    const file = formData.get('file') as File;
    const userId = formData.get('userId') as string;
    const documentType = formData.get('documentType') as ProjectDocument['document_type'];
    
    if (!name || !file || !userId || !documentType) {
      return NextResponse.json({ error: 'Name, file, userId, and documentType are required' }, { status: 400 });
    }
    
    // TODO: Implement file upload to Supabase Storage or similar
    // For now, we'll just store metadata
    const filePath = `project-docs/${params.projectId}/${file.name}`;
    const fileSize = file.size;
    const fileType = file.type.split('/').pop() || '';

    // Create the document record
    const document = await dbService.createDocument({
      name,
      file_type: fileType,
      file_path: filePath,
      file_size: fileSize,
      user_id: userId,
      is_agency_doc: false, // Project-specific document
    });
    
    // Link the document to the project
    await dbService.linkDocumentToProject(params.projectId, document.id, documentType);
    
    return NextResponse.json(document, { status: 201 });
  } catch (error: any) {
    console.error('Error uploading project document:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
