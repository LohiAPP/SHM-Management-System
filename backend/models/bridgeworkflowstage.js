
'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class BridgeWorkflowStage extends Model {
    static associate(models) {
      // define association here
    }
  }
  BridgeWorkflowStage.init({
    id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 }
  }, {
    sequelize,
    modelName: 'BridgeWorkflowStage',
    tableName: 'bridge_workflow_stages', // naive pluralization fix
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
    paranoid: true,
    underscored: true,
  });
  return BridgeWorkflowStage;
};
