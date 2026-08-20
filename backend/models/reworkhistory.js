
'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ReworkHistory extends Model {
    static associate(models) {
      // define association here
    }
  }
  ReworkHistory.init({
    id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 }
  }, {
    sequelize,
    modelName: 'ReworkHistory',
    tableName: 'rework_history', // naive pluralization fix
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
    paranoid: true,
    underscored: true,
  });
  return ReworkHistory;
};
