import { NextRequest, NextResponse } from 'next/server';
import { getDb, initDb } from '@/lib/db/init';
import { DbService } from '@/lib/db/service';

// API route for AI recommendations for section content
export async function POST(
  request: NextRequest,
  { params }: { params: { sectionId: string } }
) {
  try {
    const db = await initDb({ env: { DB: request.nextUrl.searchParams.get('_db') } });
    const dbService = new DbService(db);
    
    const body = await request.json();
    const { projectId, prompt } = body;
    
    if (!projectId) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
    }
    
    // Get the section details
    const sections = await dbService.getRfpSections(projectId);
    const currentSection = sections.find(s => s.id === params.sectionId);
    
    if (!currentSection) {
      return NextResponse.json({ error: 'Section not found' }, { status: 404 });
    }
    
    // Get selected background documents
    const backgroundDocs = await dbService.getProjectDocuments(projectId, 'background');
    const selectedDocs = backgroundDocs.filter(doc => doc.is_selected);
    
    // Get target research documents
    const targetDocs = await dbService.getProjectDocuments(projectId, 'target_research');
    
    // In a real implementation, this would call an AI service with the documents and prompt
    // For now, we'll return a mock response
    
    // Simulate AI processing time
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Generate a mock recommendation based on the section
    let recommendation = '';
    
    switch(currentSection.name) {
      case '1. Introduction':
        recommendation = 'Our team is excited to present this proposal in response to your RFP. We have carefully analyzed your requirements and developed a comprehensive solution that addresses all your needs.';
        break;
      case '2. Background':
        recommendation = 'With over 10 years of experience in the industry, our agency has successfully delivered similar projects for clients across various sectors. Our deep understanding of the market landscape positions us uniquely to address your challenges.';
        break;
      case '3. Requirements':
        recommendation = 'We acknowledge all requirements specified in the RFP and confirm our ability to meet each one. Our approach includes a phased implementation strategy that ensures all deliverables are met on time and within budget.';
        break;
      case '4. Executive Summary':
        recommendation = 'Our solution offers a comprehensive approach that leverages cutting-edge technology and industry best practices. We propose a scalable, secure, and user-friendly system that will streamline your operations and drive measurable results.';
        break;
      case '5. Timeline':
        recommendation = 'We propose a 12-week implementation timeline divided into four phases: Discovery (2 weeks), Design (3 weeks), Development (5 weeks), and Deployment (2 weeks). Each phase includes specific milestones and deliverables.';
        break;
      case '6. Budget':
        recommendation = 'Our proposed budget for this project is $X, which includes all development costs, project management, testing, and post-launch support. This represents excellent value given the scope and complexity of the project.';
        break;
      case '7. Team':
        recommendation = 'Our project team consists of seasoned professionals with relevant expertise. Key team members include a Project Manager, Lead Developer, UX Designer, and Quality Assurance Specialist, all with 5+ years of experience in their respective fields.';
        break;
      case '8. Conclusion':
        recommendation = 'We are confident in our ability to deliver an exceptional solution that meets all your requirements. We look forward to the opportunity to collaborate with your team and contribute to your organization\'s success.';
        break;
      default:
        recommendation = 'Based on the provided documents and requirements, we recommend focusing on the key value propositions that address the client\'s specific needs. Highlight our relevant experience and unique approach to solving their challenges.';
    }
    
    // Include information about which documents were used
    const docsInfo = `This recommendation was generated based on ${selectedDocs.length} background documents and ${targetDocs.length} target research documents.`;
    
    return NextResponse.json({ 
      recommendation,
      meta: {
        section: currentSection.name,
        docsInfo,
        selectedDocs: selectedDocs.map(d => d.name),
        targetDocs: targetDocs.map(d => d.name)
      }
    });
  } catch (error: any) {
    console.error('Error generating AI recommendation:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
