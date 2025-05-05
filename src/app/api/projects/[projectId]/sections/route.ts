import { NextRequest, NextResponse } from 'next/server';
import { getDb, initDb } from '@/lib/db/init';
import { DbService } from '@/lib/db/service';
import { RfpSection } from '@/lib/db/types';

// API route for managing RFP sections
export async function GET(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const db = await initDb({ env: { DB: request.nextUrl.searchParams.get('_db') } });
    const dbService = new DbService(db);
    
    const sections = await dbService.getRfpSections(params.projectId);
    
    return NextResponse.json(sections);
  } catch (error: any) {
    console.error('Error fetching RFP sections:', error);
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
    const { name, description, orderNumber } = body;
    
    if (!name || orderNumber === undefined) {
      return NextResponse.json({ error: 'Name and orderNumber are required' }, { status: 400 });
    }
    
    const section = await dbService.createRfpSection({
      project_id: params.projectId,
      name,
      description,
      order_number: orderNumber
    });
    
    return NextResponse.json(section, { status: 201 });
  } catch (error: any) {
    console.error('Error creating RFP section:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
