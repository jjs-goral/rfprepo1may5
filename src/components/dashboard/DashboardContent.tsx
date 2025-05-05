'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/supabase/AuthProvider';
import Link from 'next/link';

interface Document {
  id: string;
  name: string;
  file_type: string;
  created_at: string;
}

interface Project {
  id: string;
  name: string;
  client: string;
  start_date: string;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // This would be replaced with actual API calls in the backend implementation
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Simulate API calls with mock data for now
        // These will be replaced with actual API calls in step 007
        const mockDocuments: Document[] = [
          { id: '1', name: 'Agency deck 1', file_type: 'PDF', created_at: '2025-04-15T00:00:00Z' },
          { id: '2', name: 'Org chart', file_type: 'PNG', created_at: '2025-04-14T00:00:00Z' },
          { id: '3', name: 'Annual report', file_type: 'PDF', created_at: '2025-04-13T00:00:00Z' },
          { id: '4', name: 'RFP dog food Mar 2022', file_type: 'DOCX', created_at: '2025-04-12T00:00:00Z' },
        ];
        
        const mockProjects: Project[] = [
          { id: '1', name: 'PROJECT 1', client: 'Acme Inc.', start_date: '2025-04-15T00:00:00Z' },
          { id: '2', name: 'PROJECT 2', client: 'TechCorp', start_date: '2025-04-10T00:00:00Z' },
          { id: '3', name: 'PROJECT 3', client: 'GlobalCo', start_date: '2025-04-05T00:00:00Z' },
        ];
        
        setDocuments(mockDocuments);
        setProjects(mockProjects);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user]);

  if (!user) {
    return <div>Please log in to view your dashboard.</div>;
  }

  if (isLoading) {
    return <div className="text-center py-10">Loading dashboard data...</div>;
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.toLocaleString('default', { month: 'short' })} ${date.getDate()}, ${date.getFullYear()}`;
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Agency Background Docs */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">AGENCY BACKGROUND DOCS</h2>
          
          <div className="mb-4">
            <input
              type="text"
              placeholder="Search documents..."
              className="w-full px-4 py-2 bg-gray-100 rounded-md"
            />
          </div>
          
          <div className="space-y-2 mb-6">
            {documents.length > 0 ? (
              documents.map((doc) => (
                <div key={doc.id} className="flex justify-between items-center p-3 bg-gray-100 rounded-md">
                  <span>{doc.name}</span>
                  <span className="text-gray-500">{doc.file_type}</span>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-gray-500">No documents found</div>
            )}
          </div>
          
          <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700">
            UPLOAD NEW BACKGROUND DOC
          </button>
        </div>
        
        {/* My Projects */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">MY PROJECTS</h2>
          
          <div className="space-y-4 mb-6">
            {projects.length > 0 ? (
              projects.map((project) => (
                <Link 
                  href={`/projects/${project.id}`} 
                  key={project.id}
                  className="block border rounded-lg p-4 hover:border-blue-500 transition-colors"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-semibold text-blue-600">{project.name}</h3>
                      <p className="text-gray-600">
                        Started: {formatDate(project.start_date)} • Client: {project.client}
                      </p>
                    </div>
                    <div className="text-blue-600">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="text-center py-4 text-gray-500">No projects found</div>
            )}
          </div>
          
          <Link href="/projects/new">
            <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700">
              CREATE NEW PROJECT
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
