
'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class WorkLog extends Model {
    static associate(models) {
      // define association here
    }
  }
  WorkLog.init({
    id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 }
  }, {
    sequelize,
    modelName: 'WorkLog',
    tableName: 'work_logs', // naive pluralization fix
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
    paranoid: true,
    underscored: true,
  });
  return WorkLog;
};
