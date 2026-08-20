const fs = require('fs');
const path = require('path');

const modelsDir = path.join(__dirname, 'models');
const modelNames = [
  'Department', 'Team', 'Employee', 'User', 'EmployeeTeam',
  'Project', 'Bridge', 'WorkflowStage', 'BridgeWorkflowStage',
  'Task', 'TaskEmployee', 'WorkLog', 'WorkUpdate',
  'Document', 'DocumentVersion', 'ExtensionRequest',
  'StageApproval', 'ClientApproval', 'ReworkHistory',
  'Notification', 'ActivityLog'
];

let indexJs = `
'use strict';
const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/config.json')[env];
const db = {};

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}

fs
  .readdirSync(__dirname)
  .filter(file => {
    return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
  })
  .forEach(file => {
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
`;

fs.writeFileSync(path.join(modelsDir, 'index.js'), indexJs);

modelNames.forEach(modelName => {
  const tableName = modelName.replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase() + 's';
  const fileContent = `
'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ${modelName} extends Model {
    static associate(models) {
      // define association here
    }
  }
  ${modelName}.init({
    id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 }
  }, {
    sequelize,
    modelName: '${modelName}',
    tableName: '${tableName.replace(/historys/,'history')}', // naive pluralization fix
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
    paranoid: true,
    underscored: true,
  });
  return ${modelName};
};
`;
  fs.writeFileSync(path.join(modelsDir, `${modelName.toLowerCase()}.js`), fileContent);
});

console.log('Models generated.');
