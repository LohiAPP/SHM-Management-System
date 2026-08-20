const db = require('../models');
const ActivityLogService = require('./ActivityLogService');

class TaskService {
  static async startTask(taskId, employeeId) {
    const t = await db.sequelize.transaction();
    try {
      const task = await db.Task.findByPk(taskId, { transaction: t });
      if (task.status === 'COMPLETED') throw new Error('Cannot start a completed task');
      if (task.status === 'IN_PROGRESS') throw new Error('Task is already in progress');

      task.status = 'IN_PROGRESS';
      task.actual_start = new Date();
      await task.save({ transaction: t });

      await ActivityLogService.log({
        actor_employee_id: employeeId,
        event_type: 'TASK_STARTED',
        description: 'Task execution started',
        task_id: taskId,
        project_id: task.project_id
      }, t);

      await t.commit();
      return task;
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }

  static async startWorkLog(taskId, employeeId) {
    const t = await db.sequelize.transaction();
    try {
      // Concurrency Check
      const activeSession = await db.WorkLog.findOne({
        where: { employee_id: employeeId, session_status: 'ACTIVE' },
        transaction: t
      });

      if (activeSession) {
        throw new Error('Employee already has an active work session. Pause or complete it first.');
      }

      const log = await db.WorkLog.create({
        task_id: taskId,
        employee_id: employeeId,
        started_at: new Date(),
        session_status: 'ACTIVE'
      }, { transaction: t });

      await ActivityLogService.log({
        actor_employee_id: employeeId,
        event_type: 'WORK_SESSION_STARTED',
        description: 'Started a work session',
        task_id: taskId
      }, t);

      await t.commit();
      return log;
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }

  static async approveExtension(extensionId, approverId) {
    const t = await db.sequelize.transaction();
    try {
      const req = await db.ExtensionRequest.findByPk(extensionId, { transaction: t });
      if (!req) throw new Error('Extension request not found');

      req.status = 'APPROVED';
      req.decided_at = new Date();
      req.approver_id = approverId;
      req.approved_value = req.requested_value;
      await req.save({ transaction: t });

      await ActivityLogService.log({
        actor_user_id: approverId,
        event_type: 'EXTENSION_APPROVED',
        description: 'Extension approved for ' + req.approved_value + ' ' + req.requested_unit,
        task_id: req.task_id
      }, t);

      await t.commit();
      return req;
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }
}

module.exports = TaskService;
