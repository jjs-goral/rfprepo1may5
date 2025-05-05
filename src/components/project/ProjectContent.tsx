'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/supabase/AuthProvider';

interface Document {
  id: string;
  name: string;
  file_type: string;
  is_selected?: boolean;
}

interface RfpVersion {
  id: string;
  version_number: number;
  created_at: string;
}

export default function ProjectContent() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const [project, setProject] = useState<{
    id: string;
    name: string;
    client: string;
    start_date: string;
    status: string;
  } | null>(null);
  const [backgroundDocs, setBackgroundDocs] = useState<Document[]>([]);
  const [rfpVersions, setRfpVersions] = useState<RfpVersion[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
          status: 'In Progress'
        };
        
        const mockBackgroundDocs: Document[] = [
          { id: '1', name: 'Agency deck 1', file_type: 'PDF', is_selected: false },
          { id: '2', name: 'Org chart', file_type: 'PNG', is_selected: true },
          { id: '3', name: 'Annual report', file_type: 'PDF', is_selected: false },
          { id: '4', name: 'RFP dog food Mar 2022', file_type: 'DOCX', is_selected: true },
        ];
        
        const mockRfpVersions: RfpVersion[] = [
          { id: '1', version_number: 1, created_at: '2025-04-10T00:00:00Z' },
          { id: '2', version_number: 2, created_at: '2025-04-11T00:00:00Z' },
        ];
        
        setProject(mockProject);
        setBackgroundDocs(mockBackgroundDocs);
        setRfpVersions(mockRfpVersions);
      } catch (error) {
        console.error('Error fetching project data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user && id) {
      fetchData();
    }
  }, [user, id]);

  if (!user) {
    return <div>Please log in to view project details.</div>;
  }

  if (isLoading) {
    return <div className="text-center py-10">Loading project data...</div>;
  }

  if (!project) {
    return <div className="text-center py-10">Project not found.</div>;
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.toLocaleString('default', { month: 'short' })} ${date.getDate()}, ${date.getFullYear()}`;
  };

  const handleDocumentSelection = (docId: string) => {
    setBackgroundDocs(prevDocs => 
      prevDocs.map(doc => 
        doc.id === docId ? { ...doc, is_selected: !doc.is_selected } : doc
      )
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">
          ← Back
        </Link>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600">
            {project.name} - {formatDate(project.start_date)} - {project.client}
          </h1>
          <span className="px-4 py-1 bg-blue-100 text-blue-800 rounded-full">
            {project.status}
          </span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Active RFP */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">Active RFP</h2>
          
          <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 mb-4">
            UPLOAD NEW ACTIVE RFP
          </button>
          
          <div className="bg-blue-50 p-4 rounded-md">
            <p className="text-blue-600">Set instructions for RFP completion</p>
          </div>
        </div>
        
        {/* Target Research */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">Target Research</h2>
          
          <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 mb-4">
            UPLOAD TARGET RESEARCH DOC
          </button>
          
          <div className="bg-blue-50 p-4 rounded-md">
            <p className="text-blue-600">AI instructions for target research</p>
          </div>
        </div>
        
        {/* Stored Background Docs */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">Stored Background Docs</h2>
          
          <div className="space-y-2 mb-6">
            {backgroundDocs.length > 0 ? (
              backgroundDocs.map((doc) => (
                <div key={doc.id} className="flex items-center p-3 bg-gray-100 rounded-md">
                  <input
                    type="checkbox"
                    checked={doc.is_selected}
                    onChange={() => handleDocumentSelection(doc.id)}
                    className="mr-3 h-5 w-5 text-blue-600"
                  />
                  <span className="flex-grow">{doc.name}</span>
                  <span className="text-gray-500">{doc.file_type}</span>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-gray-500">No documents found</div>
            )}
          </div>
        </div>
        
        {/* Completed RFP Versions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">Completed RFP Versions</h2>
          
          <div className="space-y-2 mb-6">
            {rfpVersions.length > 0 ? (
              rfpVersions.map((version) => (
                <div key={version.id} className="flex justify-between items-center p-4 bg-gray-100 rounded-md">
                  <span>Version {version.version_number} - {formatDate(version.created_at)}</span>
                  <button className="px-4 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                    View
                  </button>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-gray-500">No versions generated yet</div>
            )}
          </div>
          
          <button className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700">
            MANAGE CONTRIBUTORS
          </button>
        </div>
      </div>
    </div>
  );
}
