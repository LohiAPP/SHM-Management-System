const fs = require('fs');
const path = require('path');

const modelsDir = path.join(__dirname, 'models');
const migrationsDir = path.join(__dirname, 'migrations');
const seedersDir = path.join(__dirname, 'seeders');

const schema = `
'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Enable UUID extension if using Postgres, but we are using MySQL, so UUIDs are just CHAR(36)
    
    await queryInterface.createTable('departments', {
      id: { type: Sequelize.UUID, primaryKey: true, defaultValue: Sequelize.UUIDV4 },
      code: { type: Sequelize.STRING(50), unique: true, allowNull: false },
      name: { type: Sequelize.STRING(100), unique: true, allowNull: false },
      description: { type: Sequelize.TEXT },
      status: { type: Sequelize.STRING(20), defaultValue: 'ACTIVE' },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      deleted_at: { type: Sequelize.DATE }
    });

    await queryInterface.createTable('teams', {
      id: { type: Sequelize.UUID, primaryKey: true, defaultValue: Sequelize.UUIDV4 },
      department_id: { type: Sequelize.UUID, references: { model: 'departments', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'RESTRICT' },
      code: { type: Sequelize.STRING(50), allowNull: false },
      name: { type: Sequelize.STRING(100), allowNull: false },
      description: { type: Sequelize.TEXT },
      status: { type: Sequelize.STRING(20), defaultValue: 'ACTIVE' },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      deleted_at: { type: Sequelize.DATE }
    });

    await queryInterface.createTable('employees', {
      id: { type: Sequelize.UUID, primaryKey: true, defaultValue: Sequelize.UUIDV4 },
      department_id: { type: Sequelize.UUID, references: { model: 'departments', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'RESTRICT' },
      employee_code: { type: Sequelize.STRING(50), unique: true, allowNull: false },
      first_name: { type: Sequelize.STRING(50), allowNull: false },
      last_name: { type: Sequelize.STRING(50), allowNull: false },
      display_name: { type: Sequelize.STRING(100), allowNull: false },
      phone: { type: Sequelize.STRING(20) },
      email: { type: Sequelize.STRING(255), unique: true, allowNull: false },
      employee_type: { type: Sequelize.STRING(20), defaultValue: 'BOTH' },
      status: { type: Sequelize.STRING(20), defaultValue: 'ACTIVE' },
      joined_date: { type: Sequelize.DATEONLY },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      deleted_at: { type: Sequelize.DATE }
    });

    await queryInterface.createTable('users', {
      id: { type: Sequelize.UUID, primaryKey: true, defaultValue: Sequelize.UUIDV4 },
      employee_id: { type: Sequelize.UUID, references: { model: 'employees', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'RESTRICT', allowNull: true },
      email: { type: Sequelize.STRING(255), unique: true, allowNull: false },
      password_hash: { type: Sequelize.STRING(255), allowNull: false },
      role: { type: Sequelize.STRING(20), defaultValue: 'EMPLOYEE' },
      status: { type: Sequelize.STRING(20), defaultValue: 'ACTIVE' },
      last_login_at: { type: Sequelize.DATE },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      deleted_at: { type: Sequelize.DATE }
    });

    await queryInterface.createTable('employee_teams', {
      id: { type: Sequelize.UUID, primaryKey: true, defaultValue: Sequelize.UUIDV4 },
      employee_id: { type: Sequelize.UUID, references: { model: 'employees', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      team_id: { type: Sequelize.UUID, references: { model: 'teams', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      is_active: { type: Sequelize.BOOLEAN, defaultValue: true },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
    });

    await queryInterface.createTable('workflow_stages', {
      id: { type: Sequelize.UUID, primaryKey: true, defaultValue: Sequelize.UUIDV4 },
      department_id: { type: Sequelize.UUID, references: { model: 'departments', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'RESTRICT' },
      stage_number: { type: Sequelize.INTEGER, allowNull: false },
      stage_code: { type: Sequelize.STRING(50) },
      stage_name: { type: Sequelize.STRING(100), allowNull: false },
      description: { type: Sequelize.TEXT },
      responsible_team_id: { type: Sequelize.UUID, references: { model: 'teams', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'SET NULL' },
      default_duration_days: { type: Sequelize.INTEGER, defaultValue: 1 },
      is_active: { type: Sequelize.BOOLEAN, defaultValue: true },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      deleted_at: { type: Sequelize.DATE }
    });

    await queryInterface.createTable('projects', {
      id: { type: Sequelize.UUID, primaryKey: true, defaultValue: Sequelize.UUIDV4 },
      department_id: { type: Sequelize.UUID, references: { model: 'departments', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'RESTRICT' },
      project_code: { type: Sequelize.STRING(50), unique: true, allowNull: false },
      project_name: { type: Sequelize.STRING(200), allowNull: false },
      client_name: { type: Sequelize.STRING(200) },
      location: { type: Sequelize.STRING(255) },
      status: { type: Sequelize.STRING(30), defaultValue: 'ACTIVE' },
      start_date: { type: Sequelize.DATE },
      target_end_date: { type: Sequelize.DATE },
      description: { type: Sequelize.TEXT },
      created_by: { type: Sequelize.UUID, references: { model: 'users', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'SET NULL' },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      deleted_at: { type: Sequelize.DATE }
    });

    await queryInterface.createTable('bridges', {
      id: { type: Sequelize.UUID, primaryKey: true, defaultValue: Sequelize.UUIDV4 },
      project_id: { type: Sequelize.UUID, references: { model: 'projects', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'RESTRICT' },
      bridge_code: { type: Sequelize.STRING(50) },
      bridge_name: { type: Sequelize.STRING(200), allowNull: false },
      location: { type: Sequelize.STRING(255) },
      status: { type: Sequelize.STRING(30), defaultValue: 'NOT_STARTED' },
      start_date: { type: Sequelize.DATE },
      target_end_date: { type: Sequelize.DATE },
      completed_at: { type: Sequelize.DATE },
      description: { type: Sequelize.TEXT },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      deleted_at: { type: Sequelize.DATE }
    });

    await queryInterface.createTable('bridge_workflow_stages', {
      id: { type: Sequelize.UUID, primaryKey: true, defaultValue: Sequelize.UUIDV4 },
      bridge_id: { type: Sequelize.UUID, references: { model: 'bridges', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'RESTRICT' },
      workflow_stage_id: { type: Sequelize.UUID, references: { model: 'workflow_stages', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'RESTRICT' },
      status: { type: Sequelize.STRING(30), defaultValue: 'NOT_STARTED' },
      progress: { type: Sequelize.INTEGER, defaultValue: 0 },
      started_at: { type: Sequelize.DATE },
      completed_at: { type: Sequelize.DATE },
      current_round: { type: Sequelize.INTEGER, defaultValue: 1 },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
    });

    await queryInterface.createTable('tasks', {
      id: { type: Sequelize.UUID, primaryKey: true, defaultValue: Sequelize.UUIDV4 },
      task_code: { type: Sequelize.STRING(50), unique: true, allowNull: false },
      title: { type: Sequelize.STRING(200), allowNull: false },
      description: { type: Sequelize.TEXT },
      department_id: { type: Sequelize.UUID, references: { model: 'departments', key: 'id' } },
      project_id: { type: Sequelize.UUID, references: { model: 'projects', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'RESTRICT' },
      bridge_id: { type: Sequelize.UUID, references: { model: 'bridges', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'RESTRICT' },
      bridge_workflow_stage_id: { type: Sequelize.UUID, references: { model: 'bridge_workflow_stages', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'RESTRICT' },
      team_id: { type: Sequelize.UUID, references: { model: 'teams', key: 'id' } },
      work_mode: { type: Sequelize.STRING(20), defaultValue: 'OFFICE' },
      priority: { type: Sequelize.STRING(20), defaultValue: 'MEDIUM' },
      status: { type: Sequelize.STRING(30), defaultValue: 'ASSIGNED' },
      planned_start: { type: Sequelize.DATE },
      planned_end: { type: Sequelize.DATE },
      planned_hours: { type: Sequelize.DECIMAL(8,2) },
      actual_start: { type: Sequelize.DATE },
      actual_completed_at: { type: Sequelize.DATE },
      progress: { type: Sequelize.INTEGER, defaultValue: 0 },
      created_by: { type: Sequelize.UUID, references: { model: 'users', key: 'id' } },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      deleted_at: { type: Sequelize.DATE }
    });

    await queryInterface.createTable('task_employees', {
      id: { type: Sequelize.UUID, primaryKey: true, defaultValue: Sequelize.UUIDV4 },
      task_id: { type: Sequelize.UUID, references: { model: 'tasks', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      employee_id: { type: Sequelize.UUID, references: { model: 'employees', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      assigned_by: { type: Sequelize.UUID, references: { model: 'users', key: 'id' } },
      assigned_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      removed_at: { type: Sequelize.DATE },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
    });

    await queryInterface.createTable('work_logs', {
      id: { type: Sequelize.UUID, primaryKey: true, defaultValue: Sequelize.UUIDV4 },
      task_id: { type: Sequelize.UUID, references: { model: 'tasks', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'RESTRICT' },
      employee_id: { type: Sequelize.UUID, references: { model: 'employees', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'RESTRICT' },
      started_at: { type: Sequelize.DATE, allowNull: false },
      ended_at: { type: Sequelize.DATE },
      duration_seconds: { type: Sequelize.INTEGER },
      session_status: { type: Sequelize.STRING(20), defaultValue: 'ACTIVE' },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
    });

    await queryInterface.createTable('work_updates', {
      id: { type: Sequelize.UUID, primaryKey: true, defaultValue: Sequelize.UUIDV4 },
      task_id: { type: Sequelize.UUID, references: { model: 'tasks', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'RESTRICT' },
      employee_id: { type: Sequelize.UUID, references: { model: 'employees', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'RESTRICT' },
      progress: { type: Sequelize.INTEGER },
      message: { type: Sequelize.TEXT },
      issue_description: { type: Sequelize.TEXT },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
    });

    await queryInterface.createTable('documents', {
      id: { type: Sequelize.UUID, primaryKey: true, defaultValue: Sequelize.UUIDV4 },
      project_id: { type: Sequelize.UUID, references: { model: 'projects', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'RESTRICT', allowNull: true },
      bridge_id: { type: Sequelize.UUID, references: { model: 'bridges', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'RESTRICT', allowNull: true },
      bridge_workflow_stage_id: { type: Sequelize.UUID, references: { model: 'bridge_workflow_stages', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'RESTRICT', allowNull: true },
      task_id: { type: Sequelize.UUID, references: { model: 'tasks', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'RESTRICT', allowNull: true },
      work_update_id: { type: Sequelize.UUID, references: { model: 'work_updates', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'RESTRICT', allowNull: true },
      document_type: { type: Sequelize.STRING(50) },
      current_version_id: { type: Sequelize.UUID }, // Added logic below to avoid circular fk at creation
      status: { type: Sequelize.STRING(20), defaultValue: 'ACTIVE' },
      created_by: { type: Sequelize.UUID, references: { model: 'users', key: 'id' } },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      deleted_at: { type: Sequelize.DATE }
    });

    await queryInterface.createTable('document_versions', {
      id: { type: Sequelize.UUID, primaryKey: true, defaultValue: Sequelize.UUIDV4 },
      document_id: { type: Sequelize.UUID, references: { model: 'documents', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      version_number: { type: Sequelize.INTEGER, allowNull: false },
      original_filename: { type: Sequelize.STRING(255), allowNull: false },
      storage_key: { type: Sequelize.STRING(255), allowNull: false },
      mime_type: { type: Sequelize.STRING(100) },
      file_size: { type: Sequelize.BIGINT },
      checksum: { type: Sequelize.STRING(255) },
      uploaded_by: { type: Sequelize.UUID, references: { model: 'users', key: 'id' } },
      change_description: { type: Sequelize.TEXT },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
    });

    await queryInterface.createTable('extension_requests', {
      id: { type: Sequelize.UUID, primaryKey: true, defaultValue: Sequelize.UUIDV4 },
      task_id: { type: Sequelize.UUID, references: { model: 'tasks', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'RESTRICT' },
      employee_id: { type: Sequelize.UUID, references: { model: 'employees', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'RESTRICT' },
      project_id: { type: Sequelize.UUID, references: { model: 'projects', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'RESTRICT' },
      bridge_id: { type: Sequelize.UUID, references: { model: 'bridges', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'RESTRICT' },
      original_deadline: { type: Sequelize.DATE, allowNull: false },
      requested_value: { type: Sequelize.INTEGER, allowNull: false },
      requested_unit: { type: Sequelize.STRING(20), defaultValue: 'HOURS' },
      reason: { type: Sequelize.TEXT },
      current_progress: { type: Sequelize.INTEGER },
      remaining_work: { type: Sequelize.TEXT },
      status: { type: Sequelize.STRING(20), defaultValue: 'PENDING' },
      approver_id: { type: Sequelize.UUID, references: { model: 'users', key: 'id' } },
      requested_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      decided_at: { type: Sequelize.DATE },
      approved_value: { type: Sequelize.INTEGER },
      approver_comments: { type: Sequelize.TEXT },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
    });

    await queryInterface.createTable('stage_approvals', {
      id: { type: Sequelize.UUID, primaryKey: true, defaultValue: Sequelize.UUIDV4 },
      bridge_workflow_stage_id: { type: Sequelize.UUID, references: { model: 'bridge_workflow_stages', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'RESTRICT' },
      task_id: { type: Sequelize.UUID, references: { model: 'tasks', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'RESTRICT', allowNull: true },
      requested_by: { type: Sequelize.UUID, references: { model: 'employees', key: 'id' } },
      approver_id: { type: Sequelize.UUID, references: { model: 'users', key: 'id' } },
      status: { type: Sequelize.STRING(30), defaultValue: 'PENDING' },
      submitted_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      decided_at: { type: Sequelize.DATE },
      comments: { type: Sequelize.TEXT },
      rejection_reason: { type: Sequelize.TEXT },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
    });

    await queryInterface.createTable('client_approvals', {
      id: { type: Sequelize.UUID, primaryKey: true, defaultValue: Sequelize.UUIDV4 },
      bridge_id: { type: Sequelize.UUID, references: { model: 'bridges', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'RESTRICT' },
      bridge_workflow_stage_id: { type: Sequelize.UUID, references: { model: 'bridge_workflow_stages', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'RESTRICT' },
      task_id: { type: Sequelize.UUID, references: { model: 'tasks', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'RESTRICT', allowNull: true },
      approval_type: { type: Sequelize.STRING(50) },
      status: { type: Sequelize.STRING(30), defaultValue: 'PENDING' },
      client_contact: { type: Sequelize.STRING(200) },
      submitted_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      decided_at: { type: Sequelize.DATE },
      comments: { type: Sequelize.TEXT },
      rejection_reason: { type: Sequelize.TEXT },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
    });

    await queryInterface.createTable('rework_history', {
      id: { type: Sequelize.UUID, primaryKey: true, defaultValue: Sequelize.UUIDV4 },
      project_id: { type: Sequelize.UUID, references: { model: 'projects', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'RESTRICT' },
      bridge_id: { type: Sequelize.UUID, references: { model: 'bridges', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'RESTRICT' },
      bridge_workflow_stage_id: { type: Sequelize.UUID, references: { model: 'bridge_workflow_stages', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'RESTRICT' },
      task_id: { type: Sequelize.UUID, references: { model: 'tasks', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'RESTRICT', allowNull: true },
      initiated_by: { type: Sequelize.UUID, references: { model: 'users', key: 'id' } },
      initiated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      reason: { type: Sequelize.TEXT },
      comments: { type: Sequelize.TEXT },
      return_stage_id: { type: Sequelize.UUID, references: { model: 'bridge_workflow_stages', key: 'id' } },
      return_task_id: { type: Sequelize.UUID, references: { model: 'tasks', key: 'id' }, allowNull: true },
      round_number: { type: Sequelize.INTEGER, defaultValue: 1 },
      status: { type: Sequelize.STRING(20), defaultValue: 'OPEN' },
      resolved_at: { type: Sequelize.DATE },
      resolved_by: { type: Sequelize.UUID, references: { model: 'users', key: 'id' } },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
    });

    await queryInterface.createTable('notifications', {
      id: { type: Sequelize.UUID, primaryKey: true, defaultValue: Sequelize.UUIDV4 },
      recipient_employee_id: { type: Sequelize.UUID, references: { model: 'employees', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      type: { type: Sequelize.STRING(50) },
      title: { type: Sequelize.STRING(200) },
      message: { type: Sequelize.TEXT },
      project_id: { type: Sequelize.UUID, references: { model: 'projects', key: 'id' }, allowNull: true },
      bridge_id: { type: Sequelize.UUID, references: { model: 'bridges', key: 'id' }, allowNull: true },
      task_id: { type: Sequelize.UUID, references: { model: 'tasks', key: 'id' }, allowNull: true },
      workflow_stage_id: { type: Sequelize.UUID, references: { model: 'bridge_workflow_stages', key: 'id' }, allowNull: true },
      related_entity_type: { type: Sequelize.STRING(50) },
      related_entity_id: { type: Sequelize.UUID },
      is_read: { type: Sequelize.BOOLEAN, defaultValue: false },
      read_at: { type: Sequelize.DATE },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
    });

    await queryInterface.createTable('activity_logs', {
      id: { type: Sequelize.UUID, primaryKey: true, defaultValue: Sequelize.UUIDV4 },
      actor_employee_id: { type: Sequelize.UUID, references: { model: 'employees', key: 'id' }, allowNull: true },
      actor_user_id: { type: Sequelize.UUID, references: { model: 'users', key: 'id' }, allowNull: true },
      event_type: { type: Sequelize.STRING(100) },
      description: { type: Sequelize.TEXT },
      project_id: { type: Sequelize.UUID, references: { model: 'projects', key: 'id' }, allowNull: true },
      bridge_id: { type: Sequelize.UUID, references: { model: 'bridges', key: 'id' }, allowNull: true },
      task_id: { type: Sequelize.UUID, references: { model: 'tasks', key: 'id' }, allowNull: true },
      workflow_stage_id: { type: Sequelize.UUID, references: { model: 'bridge_workflow_stages', key: 'id' }, allowNull: true },
      related_entity_type: { type: Sequelize.STRING(50) },
      related_entity_id: { type: Sequelize.UUID },
      metadata: { type: Sequelize.JSON },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
    });
  },

  down: async (queryInterface, Sequelize) => {
    const tables = [
      'activity_logs', 'notifications', 'rework_history', 'client_approvals', 'stage_approvals',
      'extension_requests', 'document_versions', 'documents', 'work_updates', 'work_logs',
      'task_employees', 'tasks', 'bridge_workflow_stages', 'bridges', 'projects', 'workflow_stages',
      'employee_teams', 'users', 'employees', 'teams', 'departments'
    ];
    for (const table of tables) {
      await queryInterface.dropTable(table);
  }
};
`;

fs.writeFileSync(path.join(migrationsDir, '20260820000000-initial-schema.js'), schema);
console.log('Migration generated.');
console.log('Migration generated.');
