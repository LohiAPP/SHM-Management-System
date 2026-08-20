const db = require('../models');

class NotificationService {
  static async notify(data, transaction = null) {
    const { 
      recipient_employee_id, type, title, message, 
      project_id, bridge_id, task_id, workflow_stage_id, 
      related_entity_type, related_entity_id 
    } = data;

    return await db.Notification.create({
      recipient_employee_id,
      type,
      title,
      message,
      project_id,
      bridge_id,
      task_id,
      workflow_stage_id,
      related_entity_type,
      related_entity_id
    }, { transaction });
  }
}

module.exports = NotificationService;
