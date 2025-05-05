'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/supabase/AuthProvider';

export default function UploadDocumentForm({ isAgencyDoc = true, projectId = null }) {
  const [name, setName] = useState('');
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { user } = useAuth();

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      // If no name is set yet, use the file name (without extension)
      if (!name) {
        const fileName = selectedFile.name.split('.').slice(0, -1).join('.');
        setName(fileName);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !file) {
      setError('Document name and file are required');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // This will be replaced with actual API call in step 007
      console.log('Uploading document:', { 
        name, 
        file: file.name, 
        size: file.size, 
        type: file.type,
        userId: user?.id,
        isAgencyDoc,
        projectId
      });
      
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
      
      // Redirect after successful upload
      if (isAgencyDoc) {
        router.push('/dashboard');
      } else {
        router.push(`/projects/${projectId}`);
      }
    } catch (err) {
      setError(err.message || 'Failed to upload document');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return <div>Please log in to upload documents.</div>;
  }

  const getFileType = (file) => {
    if (!file) return '';
    const extension = file.name.split('.').pop().toUpperCase();
    return extension;
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">
        {isAgencyDoc ? 'Upload Agency Background Document' : 'Upload Project Document'}
      </h1>
      
      <div className="bg-white rounded-lg shadow p-6">
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="name" className="block text-sm font-medium mb-1">
              Document Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          
          <div className="mb-6">
            <label htmlFor="file" className="block text-sm font-medium mb-1">
              File
            </label>
            <input
              id="file"
              type="file"
              onChange={handleFileChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
            {file && (
              <div className="mt-2 text-sm text-gray-600">
                Selected file: {file.name} ({getFileType(file)}, {Math.round(file.size / 1024)} KB)
              </div>
            )}
          </div>
          
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => isAgencyDoc ? router.push('/dashboard') : router.push(`/projects/${projectId}`)}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400"
            >
              {isLoading ? 'Uploading...' : 'Upload Document'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
