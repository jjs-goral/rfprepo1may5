import { NextRequest, NextResponse } from 'next/server';
import { getDb, initDb } from '@/lib/db/init';
import { DbService } from '@/lib/db/service';

// API route for managing section assignments for a project
export async function GET(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const db = await initDb({ env: { DB: request.nextUrl.searchParams.get('_db') } });
    const dbService = new DbService(db);
    
    const assignments = await dbService.getSectionAssignments(params.projectId);
    
    return NextResponse.json(assignments);
  } catch (error: any) {
    console.error('Error fetching section assignments:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const db = await initDb({ env: { DB: request.nextUrl.searchParams.get('_db') } });
    const dbService = new DbService(db);
    
    const assignmentsToUpdate: Record<string, string> = await request.json(); // { sectionId: userId }
    
    // TODO: Implement logic to compare with existing assignments and update accordingly
    // This might involve deleting old assignments and creating new ones, or updating existing ones.
    // For simplicity, we'll assume the DbService handles this logic or we implement it here.
    
    // Example: Iterate and assign/reassign
    for (const [sectionId, userId] of Object.entries(assignmentsToUpdate)) {
      // Check if assignment exists
      const existingAssignment = await dbService.getSectionAssignment(sectionId, userId);
      if (!existingAssignment) {
        // If user is assigned (not empty string) and assignment doesn't exist, create it
        if (userId) {
          await dbService.assignSectionToUser(sectionId, userId);
        } 
        // If user is unassigned (empty string), we might need to delete existing assignments for this section
        // This logic needs refinement based on exact requirements
      } else {
        // If user is unassigned, delete the existing assignment
        if (!userId) {
          // await dbService.deleteSectionAssignment(sectionId, existingAssignment.user_id); // Needs implementation
        }
        // If user changed, update the assignment (might involve delete + create)
        else if (userId !== existingAssignment.user_id) {
          // await dbService.deleteSectionAssignment(sectionId, existingAssignment.user_id); // Needs implementation
          await dbService.assignSectionToUser(sectionId, userId);
        }
      }
    }

    console.log('Updating assignments:', assignmentsToUpdate);
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error updating section assignments:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
