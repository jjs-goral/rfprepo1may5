import { D1Database } from '@cloudflare/workers-types';
import { User, Project, Document, ProjectDocument, RfpVersion, RfpSection, SectionAssignment, UserProject } from './types';

// Database service for interacting with the D1 database
export class DbService {
  constructor(private db: D1Database) {}

  // User methods
  async getUserById(id: string): Promise<User | null> {
    const user = await this.db.prepare('SELECT * FROM users WHERE id = ?').bind(id).first();
    return user as User | null;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const user = await this.db.prepare('SELECT * FROM users WHERE email = ?').bind(email).first();
    return user as User | null;
  }

  async createUser(user: Omit<User, 'created_at' | 'updated_at'>): Promise<User> {
    const { id, name, email } = user;
    await this.db
      .prepare('INSERT INTO users (id, name, email) VALUES (?, ?, ?)')
      .bind(id, name, email)
      .run();
    return this.getUserById(id) as Promise<User>;
  }

  // Project methods
  async getProjectById(id: string): Promise<Project | null> {
    const project = await this.db.prepare('SELECT * FROM projects WHERE id = ?').bind(id).first();
    return project as Project | null;
  }

  async getProjectsByUserId(userId: string): Promise<Project[]> {
    const projects = await this.db
      .prepare(`
        SELECT p.* FROM projects p
        JOIN user_projects up ON p.id = up.project_id
        WHERE up.user_id = ?
        ORDER BY p.start_date DESC
      `)
      .bind(userId)
      .all();
    return projects.results as Project[];
  }

  async createProject(project: Omit<Project, 'id' | 'created_at' | 'updated_at'>): Promise<Project> {
    const { name, client, start_date, status } = project;
    const result = await this.db
      .prepare('INSERT INTO projects (name, client, start_date, status) VALUES (?, ?, ?, ?) RETURNING id')
      .bind(name, client, start_date, status)
      .first();
    return this.getProjectById(result?.id as string) as Promise<Project>;
  }

  async updateProject(id: string, project: Partial<Omit<Project, 'id' | 'created_at' | 'updated_at'>>): Promise<Project> {
    const { name, client, start_date, status } = project;
    const updates: string[] = [];
    const values: any[] = [];

    if (name !== undefined) {
      updates.push('name = ?');
      values.push(name);
    }
    if (client !== undefined) {
      updates.push('client = ?');
      values.push(client);
    }
    if (start_date !== undefined) {
      updates.push('start_date = ?');
      values.push(start_date);
    }
    if (status !== undefined) {
      updates.push('status = ?');
      values.push(status);
    }

    if (updates.length > 0) {
      const query = `UPDATE projects SET ${updates.join(', ')} WHERE id = ?`;
      values.push(id);
      await this.db.prepare(query).bind(...values).run();
    }

    return this.getProjectById(id) as Promise<Project>;
  }

  // User-Project methods
  async addUserToProject(userId: string, projectId: string, role: UserProject['role']): Promise<void> {
    await this.db
      .prepare('INSERT INTO user_projects (user_id, project_id, role) VALUES (?, ?, ?)')
      .bind(userId, projectId, role)
      .run();
  }

  async getUserProjectRole(userId: string, projectId: string): Promise<UserProject['role'] | null> {
    const result = await this.db
      .prepare('SELECT role FROM user_projects WHERE user_id = ? AND project_id = ?')
      .bind(userId, projectId)
      .first();
    return result?.role as UserProject['role'] | null;
  }

  async getProjectContributors(projectId: string): Promise<{ user_id: string; name: string | null; email: string; role: string }[]> {
    const contributors = await this.db
      .prepare(`
        SELECT u.id as user_id, u.name, u.email, up.role
        FROM users u
        JOIN user_projects up ON u.id = up.user_id
        WHERE up.project_id = ?
      `)
      .bind(projectId)
      .all();
    return contributors.results as { user_id: string; name: string | null; email: string; role: string }[];
  }

  // Document methods
  async getDocumentById(id: string): Promise<Document | null> {
    const document = await this.db.prepare('SELECT * FROM documents WHERE id = ?').bind(id).first();
    return document as Document | null;
  }

  async getAgencyDocuments(userId: string): Promise<Document[]> {
    const documents = await this.db
      .prepare('SELECT * FROM documents WHERE is_agency_doc = true ORDER BY created_at DESC')
      .all();
    return documents.results as Document[];
  }

  async createDocument(document: Omit<Document, 'id' | 'created_at' | 'updated_at'>): Promise<Document> {
    const { name, file_type, file_path, file_size, user_id, is_agency_doc } = document;
    const result = await this.db
      .prepare('INSERT INTO documents (name, file_type, file_path, file_size, user_id, is_agency_doc) VALUES (?, ?, ?, ?, ?, ?) RETURNING id')
      .bind(name, file_type, file_path, file_size, user_id, is_agency_doc)
      .first();
    return this.getDocumentById(result?.id as string) as Promise<Document>;
  }

  // Project-Document methods
  async linkDocumentToProject(projectId: string, documentId: string, documentType: ProjectDocument['document_type'], isSelected: boolean = false): Promise<void> {
    await this.db
      .prepare('INSERT INTO project_documents (project_id, document_id, document_type, is_selected) VALUES (?, ?, ?, ?)')
      .bind(projectId, documentId, documentType, isSelected)
      .run();
  }

  async getProjectDocuments(projectId: string, documentType?: ProjectDocument['document_type']): Promise<(Document & { is_selected: boolean })[]> {
    let query = `
      SELECT d.*, pd.is_selected
      FROM documents d
      JOIN project_documents pd ON d.id = pd.document_id
      WHERE pd.project_id = ?
    `;
    const params = [projectId];

    if (documentType) {
      query += ' AND pd.document_type = ?';
      params.push(documentType);
    }

    query += ' ORDER BY d.created_at DESC';

    const documents = await this.db.prepare(query).bind(...params).all();
    return documents.results as (Document & { is_selected: boolean })[];
  }

  async updateDocumentSelection(projectId: string, documentId: string, isSelected: boolean): Promise<void> {
    await this.db
      .prepare('UPDATE project_documents SET is_selected = ? WHERE project_id = ? AND document_id = ?')
      .bind(isSelected, projectId, documentId)
      .run();
  }

  // RFP Version methods
  async createRfpVersion(projectId: string, filePath: string): Promise<RfpVersion> {
    // Get the next version number
    const result = await this.db
      .prepare('SELECT COALESCE(MAX(version_number), 0) + 1 as next_version FROM rfp_versions WHERE project_id = ?')
      .bind(projectId)
      .first();
    const versionNumber = (result?.next_version as number) || 1;

    await this.db
      .prepare('INSERT INTO rfp_versions (project_id, version_number, file_path) VALUES (?, ?, ?)')
      .bind(projectId, versionNumber, filePath)
      .run();

    const version = await this.db
      .prepare('SELECT * FROM rfp_versions WHERE project_id = ? AND version_number = ?')
      .bind(projectId, versionNumber)
      .first();
    return version as RfpVersion;
  }

  async getRfpVersions(projectId: string): Promise<RfpVersion[]> {
    const versions = await this.db
      .prepare('SELECT * FROM rfp_versions WHERE project_id = ? ORDER BY version_number DESC')
      .bind(projectId)
      .all();
    return versions.results as RfpVersion[];
  }

  // RFP Section methods
  async createRfpSection(section: Omit<RfpSection, 'id' | 'created_at' | 'updated_at'>): Promise<RfpSection> {
    const { project_id, name, description, order_number } = section;
    const result = await this.db
      .prepare('INSERT INTO rfp_sections (project_id, name, description, order_number) VALUES (?, ?, ?, ?) RETURNING id')
      .bind(project_id, name, description, order_number)
      .first();
    
    const createdSection = await this.db
      .prepare('SELECT * FROM rfp_sections WHERE id = ?')
      .bind(result?.id as string)
      .first();
    return createdSection as RfpSection;
  }

  async getRfpSections(projectId: string): Promise<RfpSection[]> {
    const sections = await this.db
      .prepare('SELECT * FROM rfp_sections WHERE project_id = ? ORDER BY order_number')
      .bind(projectId)
      .all();
    return sections.results as RfpSection[];
  }

  // Section Assignment methods
  async assignSectionToUser(sectionId: string, userId: string): Promise<void> {
    await this.db
      .prepare('INSERT INTO section_assignments (section_id, user_id) VALUES (?, ?)')
      .bind(sectionId, userId)
      .run();
  }

  async updateSectionAssignment(sectionId: string, userId: string, content: string | null, status: SectionAssignment['status']): Promise<void> {
    await this.db
      .prepare('UPDATE section_assignments SET content = ?, status = ? WHERE section_id = ? AND user_id = ?')
      .bind(content, status, sectionId, userId)
      .run();
  }

  async getSectionAssignment(sectionId: string, userId: string): Promise<SectionAssignment | null> {
    const assignment = await this.db
      .prepare('SELECT * FROM section_assignments WHERE section_id = ? AND user_id = ?')
      .bind(sectionId, userId)
      .first();
    return assignment as SectionAssignment | null;
  }

  async getSectionAssignments(projectId: string): Promise<(SectionAssignment & { section_name: string; user_name: string | null; user_email: string })[]> {
    const assignments = await this.db
      .prepare(`
        SELECT sa.*, rs.name as section_name, u.name as user_name, u.email as user_email
        FROM section_assignments sa
        JOIN rfp_sections rs ON sa.section_id = rs.id
        JOIN users u ON sa.user_id = u.id
        WHERE rs.project_id = ?
        ORDER BY rs.order_number
      `)
      .bind(projectId)
      .all();
    return assignments.results as (SectionAssignment & { section_name: string; user_name: string | null; user_email: string })[];
  }

  async getUserAssignments(userId: string): Promise<(SectionAssignment & { section_name: string; project_id: string; project_name: string })[]> {
    const assignments = await this.db
      .prepare(`
        SELECT sa.*, rs.name as section_name, rs.project_id, p.name as project_name
        FROM section_assignments sa
        JOIN rfp_sections rs ON sa.section_id = rs.id
        JOIN projects p ON rs.project_id = p.id
        WHERE sa.user_id = ?
        ORDER BY sa.updated_at DESC
      `)
      .bind(userId)
      .all();
    return assignments.results as (SectionAssignment & { section_name: string; project_id: string; project_name: string })[];
  }
}
