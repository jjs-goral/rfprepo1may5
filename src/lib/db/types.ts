// Database model types for the RFP Generator application

export interface User {
  id: string;
  name: string | null;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  name: string;
  client: string;
  start_date: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface UserProject {
  id: string;
  user_id: string;
  project_id: string;
  role: 'owner' | 'manager' | 'contributor';
  created_at: string;
}

export interface Document {
  id: string;
  name: string;
  file_type: string;
  file_path: string;
  file_size: number;
  user_id: string;
  is_agency_doc: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProjectDocument {
  id: string;
  project_id: string;
  document_id: string;
  document_type: 'active_rfp' | 'target_research' | 'background';
  is_selected: boolean;
  created_at: string;
}

export interface RfpVersion {
  id: string;
  project_id: string;
  version_number: number;
  file_path: string;
  created_at: string;
}

export interface RfpSection {
  id: string;
  project_id: string;
  name: string;
  description: string | null;
  order_number: number;
  created_at: string;
  updated_at: string;
}

export interface SectionAssignment {
  id: string;
  section_id: string;
  user_id: string;
  content: string | null;
  status: 'Not Started' | 'In Progress' | 'Completed';
  created_at: string;
  updated_at: string;
}
