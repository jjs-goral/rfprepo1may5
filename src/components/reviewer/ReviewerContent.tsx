
'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/supabase/AuthProvider';

interface RfpSection {
  id: string;
  name: string;
  description: string | null;
  order_number: number;
}

interface SectionAssignment {
  id: string;
  section_id: string;
  user_id: string;
  content: string | null;
  status: 'Not Started' | 'In Progress' | 'Completed';
}

export default function ReviewerContent() {
  const { projectId, sectionId } = useParams<{ projectId: string; sectionId: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const [project, setProject] = useState<{
    id: string;
    name: string;
    client: string;
    start_date: string;
  } | null>(null);
  const [sections, setSections] = useState<RfpSection[]>([]);
  const [currentSection, setCurrentSection] = useState<RfpSection | null>(null);
  const [assignment, setAssignment] = useState<SectionAssignment | null>(null);
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // This would be replaced with actual API calls in the backend implementation
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Simulate API calls with mock data for now
        // These will be replaced with actual API calls in step 007
        const mockProject = {
          id: '1',
          name: 'PROJECT 1',
          client: 'Acme Inc.',
          start_date: '2025-04-15T00:00:00Z',
        };
        
        const mockSections: RfpSection[] = [
          { id: 's1', name: '1. Introduction', description: 'Intro text', order_number: 1 },
          { id: 's2', name: '2. Background', description: 'Background text', order_number: 2 },
          { id: 's3', name: '3. Requirements', description: 'Requirements text', order_number: 3 },
          { id: 's4', name: '4. Executive Summary', description: 'This section requires a concise overview of the proposed solution...', order_number: 4 },
          { id: 's5', name: '5. Timeline', description: 'Timeline text', order_number: 5 },
          { id: 's6', name: '6. Budget', description: 'Budget text', order_number: 6 },
          { id: 's7', name: '7. Team', description: 'Team text', order_number: 7 },
          { id: 's8', name: '8. Conclusion', description: 'Conclusion text', order_number: 8 },
        ];
        
        const mockAssignment: SectionAssignment = {
          id: 'a1',
          section_id: 's4',
          user_id: user?.id || '',
          content: 'Acme Inc. offers a comprehensive solution that leverages...', 
          status: 'In Progress',
        };

        setProject(mockProject);
        setSections(mockSections);
        const foundSection = mockSections.find(s => s.id === sectionId);
        setCurrentSection(foundSection || null);
        setAssignment(mockAssignment);
        setContent(mockAssignment.content || '');

      } catch (error) {
        console.error('Error fetching reviewer data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user && projectId && sectionId) {
      fetchData();
    }
  }, [user, projectId, sectionId]);

  const handleSaveDraft = async () => {
    setIsSaving(true);
    try {
      // Simulate API call to save draft
      console.log('Saving draft:', { sectionId, userId: user?.id, content });
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
      // Update assignment status if needed
      if (assignment && assignment.status === 'Not Started') {
        setAssignment({ ...assignment, status: 'In Progress' });
      }
    } catch (error) {
      console.error('Error saving draft:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmitSection = async () => {
    setIsSubmitting(true);
    try {
      // Simulate API call to submit section
      console.log('Submitting section:', { sectionId, userId: user?.id, content });
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
      if (assignment) {
        setAssignment({ ...assignment, status: 'Completed' });
      }
      // Optionally navigate back to project page or next section
      router.push(`/projects/${projectId}`);
    } catch (error) {
      console.error('Error submitting section:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return <div>Please log in to view this section.</div>;
  }

  if (isLoading) {
    return <div className="text-center py-10">Loading section data...</div>;
  }

  if (!project || !currentSection || !assignment) {
    return <div className="text-center py-10">Section or assignment not found.</div>;
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.toLocaleString('default', { month: 'short' })} ${date.getDate()}, ${date.getFullYear()}`;
  };

  // Calculate progress (simple example)
  const progress = 50; // This would be calculated based on completed sections

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link href={`/projects/${projectId}`} className="text-gray-600 hover:text-gray-900">
          ← Back to Project
        </Link>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-xl font-bold text-blue-600 mb-2">
          {project.name} - {formatDate(project.start_date)} - {project.client}
        </h1>
        <p className="text-gray-600 mb-4">
          Reviewer: {user.name || user.email} • Section: {currentSection.name}
        </p>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div className="bg-green-500 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
        </div>
        <p className="text-sm text-gray-500 mt-1 text-right">{progress}% Complete</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* RFP Document Outline */}
        <div className="md:col-span-1 bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-bold mb-4">RFP Document</h2>
          <ul className="space-y-1">
            {sections.map((section) => (
              <li key={section.id}>
                <Link 
                  href={`/projects/${projectId}/review/${section.id}`}
                  className={`block p-3 rounded-md ${section.id === sectionId ? 'bg-blue-100 border border-blue-500' : 'hover:bg-gray-100'}`}
                >
                  <span className="font-semibold">{section.name}</span>
                  {section.id === sectionId && (
                    <p className="text-sm text-gray-600 mt-1">{section.description}</p>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        
        {/* Your Section Editor */}
        <div className="md:col-span-2 bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-bold mb-4">Your Section: {currentSection.name}</h2>
          
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full h-64 p-3 border border-gray-300 rounded-md mb-4"
            placeholder="Enter your content here..."
            disabled={assignment.status === 'Completed'}
          />
          
          <div className="flex justify-between items-center">
            <button 
              className="px-4 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200"
              disabled={assignment.status === 'Completed'}
            >
              Get AI recommendations
            </button>
            
            <div className="space-x-3">
              <button 
                onClick={handleSaveDraft}
                disabled={isSaving || isSubmitting || assignment.status === 'Completed'}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : 'Save Draft'}
              </button>
              <button 
                onClick={handleSubmitSection}
                disabled={isSaving || isSubmitting || assignment.status === 'Completed'}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Section'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

