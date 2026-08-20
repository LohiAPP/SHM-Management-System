const fs = require('fs');
const path = require('path');

const resources = ['Project','Bridge','WorkflowStage','Task','Employee','Team','WorkLog','WorkUpdate','ExtensionRequest','ReworkHistory','StageApproval','ClientApproval','Document','Notification','ActivityLog'];
const routes = resources.map(r => {
  return { name: r, route: r.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase() + 's' };
});

let reqs = '';
let mounts = '';

routes.forEach(r => {
  const ctrl = 
"const db = require('../models');\\n" +
"exports.getAll = async (req, res, next) => { try { const data = await db." + r.name + ".findAndCountAll({ limit: 20 }); res.json({ success: true, data: data.rows, pagination: { total: data.count } }); } catch (e) { next(e); } };\\n" +
"exports.getById = async (req, res, next) => { try { const data = await db." + r.name + ".findByPk(req.params.id); res.json({ success: true, data }); } catch (e) { next(e); } };\\n" +
"exports.create = async (req, res, next) => { try { const data = await db." + r.name + ".create(req.body); res.status(201).json({ success: true, data }); } catch (e) { next(e); } };\\n" +
"exports.update = async (req, res, next) => { try { await db." + r.name + ".update(req.body, { where: { id: req.params.id } }); res.json({ success: true, message: 'Updated' }); } catch (e) { next(e); } };\\n" +
"exports.delete = async (req, res, next) => { try { await db." + r.name + ".destroy({ where: { id: req.params.id } }); res.json({ success: true, message: 'Deleted' }); } catch (e) { next(e); } };\\n";

  fs.writeFileSync(path.join(__dirname, 'controllers', r.name + 'Controller.js'), ctrl);

  const routeStr = 
"const express = require('express');\\n" +
"const router = express.Router();\\n" +
"const ctrl = require('../controllers/" + r.name + "Controller');\\n" +
"router.get('/', ctrl.getAll);\\n" +
"router.get('/:id', ctrl.getById);\\n" +
"router.post('/', ctrl.create);\\n" +
"router.put('/:id', ctrl.update);\\n" +
"router.delete('/:id', ctrl.delete);\\n" +
"module.exports = router;\\n";

  fs.writeFileSync(path.join(__dirname, 'routes', r.route + '.js'), routeStr);

  reqs += "const " + r.name + "Routes = require('./routes/" + r.route + "');\\n";
  mounts += "app.use('/api/" + r.route + "', " + r.name + "Routes);\\n";
});

let srv = fs.readFileSync('server.js', 'utf8');
srv = srv.replace('// Sync database and start server', "const errorHandler = require('./middleware/errorHandler');\\n" + reqs + "\\n" + mounts + "\\napp.use(errorHandler);\\n\\n// Sync database and start server");
fs.writeFileSync('server.js', srv);

console.log('Generator finished successfully.');
