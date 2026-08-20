const db = require('../models');

class ActivityLogService {
  static async log(data, transaction = null) {
    const { 
      actor_employee_id, actor_user_id, event_type, description, 
      project_id, bridge_id, task_id, workflow_stage_id, 
      related_entity_type, related_entity_id, metadata 
    } = data;

    return await db.ActivityLog.create({
      actor_employee_id,
      actor_user_id,
      event_type,
      description,
      project_id,
      bridge_id,
      task_id,
      workflow_stage_id,
      related_entity_type,
      related_entity_id,
      metadata
    }, { transaction });
  }
}

module.exports = ActivityLogService;
