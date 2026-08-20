
'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Bridge extends Model {
    static associate(models) {
      // define association here
    }
  }
  Bridge.init({
    id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 }
  }, {
    sequelize,
    modelName: 'Bridge',
    tableName: 'bridges', // naive pluralization fix
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
    paranoid: true,
    underscored: true,
  });
  return Bridge;
};
