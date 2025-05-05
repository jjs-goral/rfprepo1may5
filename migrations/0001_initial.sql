-- Create users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  client TEXT NOT NULL,
  start_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  status TEXT DEFAULT 'In Progress',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create user_projects table (for project access control)
CREATE TABLE IF NOT EXISTS user_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'contributor', -- 'owner', 'manager', 'contributor'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, project_id)
);

-- Create documents table (for agency background docs)
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  is_agency_doc BOOLEAN DEFAULT TRUE, -- true for agency docs, false for project-specific docs
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create project_documents table (for linking documents to projects)
CREATE TABLE IF NOT EXISTS project_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL, -- 'active_rfp', 'target_research', 'background'
  is_selected BOOLEAN DEFAULT FALSE, -- for background docs selection
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(project_id, document_id)
);

-- Create rfp_versions table (for completed RFP versions)
CREATE TABLE IF NOT EXISTS rfp_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  file_path TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(project_id, version_number)
);

-- Create rfp_sections table (for RFP document sections)
CREATE TABLE IF NOT EXISTS rfp_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  order_number INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(project_id, order_number)
);

-- Create section_assignments table (for assigning sections to contributors)
CREATE TABLE IF NOT EXISTS section_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id UUID NOT NULL REFERENCES rfp_sections(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT,
  status TEXT DEFAULT 'Not Started', -- 'Not Started', 'In Progress', 'Completed'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(section_id, user_id)
);

-- Create RLS policies
-- Users can only see their own data
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY users_policy ON users
  USING (id = auth.uid());

-- Projects are visible to users who have access to them
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY projects_policy ON projects
  USING (id IN (SELECT project_id FROM user_projects WHERE user_id = auth.uid()));

-- User-project relationships are visible to the users involved
ALTER TABLE user_projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY user_projects_policy ON user_projects
  USING (user_id = auth.uid() OR 
         project_id IN (SELECT project_id FROM user_projects WHERE user_id = auth.uid() AND role IN ('owner', 'manager')));

-- Documents are visible to their owners and users with access to related projects
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY documents_policy ON documents
  USING (user_id = auth.uid() OR 
         id IN (SELECT document_id FROM project_documents WHERE project_id IN 
                (SELECT project_id FROM user_projects WHERE user_id = auth.uid())));

-- Project-document relationships are visible to users with access to the project
ALTER TABLE project_documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY project_documents_policy ON project_documents
  USING (project_id IN (SELECT project_id FROM user_projects WHERE user_id = auth.uid()));

-- RFP versions are visible to users with access to the project
ALTER TABLE rfp_versions ENABLE ROW LEVEL SECURITY;
CREATE POLICY rfp_versions_policy ON rfp_versions
  USING (project_id IN (SELECT project_id FROM user_projects WHERE user_id = auth.uid()));

-- RFP sections are visible to users with access to the project
ALTER TABLE rfp_sections ENABLE ROW LEVEL SECURITY;
CREATE POLICY rfp_sections_policy ON rfp_sections
  USING (project_id IN (SELECT project_id FROM user_projects WHERE user_id = auth.uid()));

-- Section assignments are visible to the assigned user and project managers/owners
ALTER TABLE section_assignments ENABLE ROW LEVEL SECURITY;
CREATE POLICY section_assignments_policy ON section_assignments
  USING (user_id = auth.uid() OR 
         section_id IN (SELECT id FROM rfp_sections WHERE project_id IN 
                       (SELECT project_id FROM user_projects WHERE user_id = auth.uid() AND role IN ('owner', 'manager'))));

-- Create functions and triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_timestamp
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE PROCEDURE update_timestamp();

CREATE TRIGGER update_projects_timestamp
BEFORE UPDATE ON projects
FOR EACH ROW EXECUTE PROCEDURE update_timestamp();

CREATE TRIGGER update_documents_timestamp
BEFORE UPDATE ON documents
FOR EACH ROW EXECUTE PROCEDURE update_timestamp();

CREATE TRIGGER update_rfp_sections_timestamp
BEFORE UPDATE ON rfp_sections
FOR EACH ROW EXECUTE PROCEDURE update_timestamp();

CREATE TRIGGER update_section_assignments_timestamp
BEFORE UPDATE ON section_assignments
FOR EACH ROW EXECUTE PROCEDURE update_timestamp();
