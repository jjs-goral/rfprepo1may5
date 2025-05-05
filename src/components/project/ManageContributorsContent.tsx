
'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/supabase/AuthProvider';

interface Contributor {
  user_id: string;
  name: string | null;
  email: string;
  role: string;
}

interface RfpSection {
  id: string;
  name: string;
  order_number: number;
}

interface SectionAssignment {
  section_id: string;
  user_id: string;
}

export default function ManageContributorsContent() {
  const { projectId } = useParams<{ projectId: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const [contributors, setContributors] = useState<Contributor[]>([]);
  const [sections, setSections] = useState<RfpSection[]>([]);
  const [assignments, setAssignments] = useState<Record<string, string>>({}); // sectionId -> userId
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // This would be replaced with actual API calls in the backend implementation
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Simulate API calls with mock data for now
        // These will be replaced with actual API calls in step 007
        const mockContributors: Contributor[] = [
          { user_id: 'user1', name: 'Alice', email: 'alice@example.com', role: 'manager' },
          { user_id: 'user2', name: 'Bob', email: 'bob@example.com', role: 'contributor' },
          { user_id: 'user3', name: 'Charlie', email: 'charlie@example.com', role: 'contributor' },
        ];
        
        const mockSections: RfpSection[] = [
          { id: 's1', name: '1. Introduction', order_number: 1 },
          { id: 's2', name: '2. Background', order_number: 2 },
          { id: 's3', name: '3. Requirements', order_number: 3 },
          { id: 's4', name: '4. Executive Summary', order_number: 4 },
          { id: 's5', name: '5. Timeline', order_number: 5 },
          { id: 's6', name: '6. Budget', order_number: 6 },
          { id: 's7', name: '7. Team', order_number: 7 },
          { id: 's8', name: '8. Conclusion', order_number: 8 },
        ];
        
        const mockAssignments: Record<string, string> = {
          's1': 'user1',
          's4': 'user2',
          's7': 'user3',
        };

        setContributors(mockContributors);
        setSections(mockSections);
        setAssignments(mockAssignments);

      } catch (error) {
        console.error('Error fetching contributor data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user && projectId) {
      fetchData();
    }
  }, [user, projectId]);

  const handleAssignmentChange = (sectionId: string, userId: string) => {
    setAssignments(prev => ({ ...prev, [sectionId]: userId }));
  };

  const handleSaveChanges = async () => {
    // Simulate API call to save assignments
    console.log('Saving assignments:', assignments);
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
    router.push(`/projects/${projectId}`);
  };

  if (!user) {
    return <div>Please log in to manage contributors.</div>;
  }

  if (isLoading) {
    return <div className="text-center py-10">Loading contributor data...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Manage Contributors for Project</h1>
      
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">Assign Sections</h2>
        
        <div className="space-y-4">
          {sections.map(section => (
            <div key={section.id} className="flex items-center justify-between border-b pb-4">
              <span className="font-semibold">{section.name}</span>
              <select
                value={assignments[section.id] || ''}
                onChange={(e) => handleAssignmentChange(section.id, e.target.value)}
                className="p-2 border border-gray-300 rounded-md"
              >
                <option value="">Unassigned</option>
                {contributors.map(contributor => (
                  <option key={contributor.user_id} value={contributor.user_id}>
                    {contributor.name || contributor.email}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
        
        <div className="mt-6 flex justify-end space-x-3">
          <button 
            onClick={() => router.push(`/projects/${projectId}`)}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
          >
            Cancel
          </button>
          <button 
            onClick={handleSaveChanges}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

