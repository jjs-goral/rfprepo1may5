import React from 'react';
import ReviewerContent from '@/components/reviewer/ReviewerContent';

export default function ReviewerPage({ params }: { params: { projectId: string; sectionId: string } }) {
  return <ReviewerContent />;
}
