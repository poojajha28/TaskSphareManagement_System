
/**
 * Centralized validation helpers for request data.
 * Keeps controllers clean — just call the validator and get errors back.
 */

const VALID_PRIORITIES = ['low', 'medium', 'high'];
const VALID_TASK_STATUSES = ['todo', 'in-progress', 'done'];
const VALID_ROLES = ['user', 'admin'];

// Email format regex (basic RFC 5322)
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Validate signup input
 */
function validateSignup(body) {
  const errors = [];
  const { name, email, password, role } = body;

  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    errors.push('Name is required and must be at least 2 characters');
  }

  if (!email || !EMAIL_REGEX.test(email)) {
    errors.push('A valid email address is required');
  }

  if (!password || typeof password !== 'string' || password.length < 6) {
    errors.push('Password is required and must be at least 6 characters');
  }

  if (role && !VALID_ROLES.includes(role)) {
    errors.push(`Role must be one of: ${VALID_ROLES.join(', ')}`);
  }

  return errors;
}

/**
 * Validate login input
 */
function validateLogin(body) {
  const errors = [];
  const { email, password } = body;

  if (!email || !EMAIL_REGEX.test(email)) {
    errors.push('A valid email address is required');
  }

  if (!password || typeof password !== 'string' || password.length === 0) {
    errors.push('Password is required');
  }

  return errors;
}

/**
 * Validate project creation input
 */
function validateProject(body) {
  const errors = [];
  const { name, priority } = body;

  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    errors.push('Project name is required and must be at least 2 characters');
  }

  if (!priority || !VALID_PRIORITIES.includes(priority)) {
    errors.push(`Priority is required and must be one of: ${VALID_PRIORITIES.join(', ')}`);
  }

  if (body.estimated_hours !== undefined && body.estimated_hours !== null && body.estimated_hours !== '') {
    const hours = Number(body.estimated_hours);
    if (isNaN(hours) || hours < 0) {
      errors.push('Estimated hours must be a non-negative number');
    }
  }

  return errors;
}

/**
 * Validate task creation input
 */
function validateTask(body) {
  const errors = [];
  const { title, priority, assigned_to } = body;

  if (!title || typeof title !== 'string' || title.trim().length < 2) {
    errors.push('Task title is required and must be at least 2 characters');
  }

  if (!priority || !VALID_PRIORITIES.includes(priority)) {
    errors.push(`Priority is required and must be one of: ${VALID_PRIORITIES.join(', ')}`);
  }

  if (!assigned_to) {
    errors.push('Task must be assigned to a user');
  }

  if (body.estimated_hours !== undefined && body.estimated_hours !== null && body.estimated_hours !== '') {
    const hours = Number(body.estimated_hours);
    if (isNaN(hours) || hours < 0) {
      errors.push('Estimated hours must be a non-negative number');
    }
  }

  return errors;
}

/**
 * Validate task status update
 */
function validateTaskStatus(body) {
  const errors = [];
  const { status } = body;

  if (!status || !VALID_TASK_STATUSES.includes(status)) {
    errors.push(`Status is required and must be one of: ${VALID_TASK_STATUSES.join(', ')}`);
  }

  return errors;
}

module.exports = {
  validateSignup,
  validateLogin,
  validateProject,
  validateTask,
  validateTaskStatus,
  VALID_PRIORITIES,
  VALID_TASK_STATUSES,
  VALID_ROLES
};
