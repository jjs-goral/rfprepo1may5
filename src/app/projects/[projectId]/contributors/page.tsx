import React from 'react';
import ManageContributorsContent from '@/components/project/ManageContributorsContent';

export default function ManageContributorsPage({ params }: { params: { projectId: string } }) {
  return <ManageContributorsContent />;
}
