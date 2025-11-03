const pool = require('../config/database');

class ProjectService {
  async getAllProjects() {
    const [projects] = await pool.execute(
      'SELECT * FROM projects ORDER BY created_at DESC'
    );
    return projects;
  }

  async createProject(projectData, createdBy) {
    const { name, description, priority, due_date, estimated_hours } = projectData;
    
    const [result] = await pool.execute(
      `INSERT INTO projects (name, description, status, priority, due_date, estimated_hours, created_by) 
       VALUES (?, ?, 'planning', ?, ?, ?, ?)`,
      [name, description, priority, due_date, estimated_hours, createdBy]
    );
    
    return { id: result.insertId };
  }
}

module.exports = new ProjectService();

