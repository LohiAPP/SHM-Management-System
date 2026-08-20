
'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class StageApproval extends Model {
    static associate(models) {
      // define association here
    }
  }
  StageApproval.init({
    id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 }
  }, {
    sequelize,
    modelName: 'StageApproval',
    tableName: 'stage_approvals', // naive pluralization fix
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
    paranoid: true,
    underscored: true,
  });
  return StageApproval;
};
