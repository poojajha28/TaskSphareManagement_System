
const pool = require('../config/database');

class ProjectService {
  async getAllProjects() {
    const [projects] = await pool.execute(
      'SELECT * FROM projects ORDER BY created_at DESC'
    );
    return projects;
  }

  async getProjectsByUser(userId) {
    // Returns projects where user is a member OR the creator
    const [projects] = await pool.execute(
      `SELECT DISTINCT p.* FROM projects p
       LEFT JOIN project_members pm ON p.id = pm.project_id
       WHERE p.created_by = ? OR pm.user_id = ?
       ORDER BY p.created_at DESC`,
      [userId, userId]
    );
    return projects;
  }

  async getProjectById(projectId) {
    const [projects] = await pool.execute(
      'SELECT * FROM projects WHERE id = ?',
      [projectId]
    );
    if (projects.length === 0) {
      throw new Error('Project not found');
    }
    return projects[0];
  }

  async createProject(projectData, createdBy) {
    const { name, description, priority, due_date, estimated_hours } = projectData;
    
    const [result] = await pool.execute(
      `INSERT INTO projects (name, description, status, priority, due_date, estimated_hours, created_by) 
       VALUES (?, ?, 'planning', ?, ?, ?, ?)`,
      [name, description, priority, due_date, estimated_hours, createdBy]
    );

    // Creator automatically becomes a member with 'admin' role in this project
    await pool.execute(
      `INSERT INTO project_members (project_id, user_id, role) VALUES (?, ?, 'admin')`,
      [result.insertId, createdBy]
    );
    
    return { id: result.insertId };
  }

  async getProjectMembers(projectId) {
    const [members] = await pool.execute(
      `SELECT pm.id as membership_id, pm.role as project_role, pm.joined_at,
              u.id, u.name, u.email, u.role, u.tasks_completed
       FROM project_members pm
       JOIN users u ON pm.user_id = u.id
       WHERE pm.project_id = ?
       ORDER BY pm.joined_at ASC`,
      [projectId]
    );
    return members;
  }

  async addMember(projectId, userId) {
    // Check if user is already a member
    const [existing] = await pool.execute(
      'SELECT id FROM project_members WHERE project_id = ? AND user_id = ?',
      [projectId, userId]
    );
    if (existing.length > 0) {
      throw new Error('User is already a member of this project');
    }

    await pool.execute(
      `INSERT INTO project_members (project_id, user_id, role) VALUES (?, ?, 'member')`,
      [projectId, userId]
    );
    return { message: 'Member added successfully' };
  }

  async removeMember(projectId, userId) {
    // Check if trying to remove the project creator (admin)
    const [project] = await pool.execute(
      'SELECT created_by FROM projects WHERE id = ?',
      [projectId]
    );
    if (project.length > 0 && project[0].created_by === parseInt(userId)) {
      throw new Error('Cannot remove the project creator');
    }

    const [result] = await pool.execute(
      'DELETE FROM project_members WHERE project_id = ? AND user_id = ?',
      [projectId, userId]
    );
    if (result.affectedRows === 0) {
      throw new Error('Member not found in this project');
    }
    return { message: 'Member removed successfully' };
  }

  async isProjectAdmin(projectId, userId) {
    const [project] = await pool.execute(
      'SELECT created_by FROM projects WHERE id = ?',
      [projectId]
    );
    return project.length > 0 && project[0].created_by === userId;
  }

  async isProjectMember(projectId, userId) {
    const [members] = await pool.execute(
      'SELECT id FROM project_members WHERE project_id = ? AND user_id = ?',
      [projectId, userId]
    );
    return members.length > 0;
  }
}

module.exports = new ProjectService();

