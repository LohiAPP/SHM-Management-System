
'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ExtensionRequest extends Model {
    static associate(models) {
      // define association here
    }
  }
  ExtensionRequest.init({
    id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 }
  }, {
    sequelize,
    modelName: 'ExtensionRequest',
    tableName: 'extension_requests', // naive pluralization fix
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
    paranoid: true,
    underscored: true,
  });
  return ExtensionRequest;
};
