const db = require('../models');
exports.getAll = async (req, res, next) => { try { const data = await db.WorkLog.findAndCountAll({ limit: 20 }); res.json({ success: true, data: data.rows, pagination: { total: data.count } }); } catch (e) { next(e); } };
exports.getById = async (req, res, next) => { try { const data = await db.WorkLog.findByPk(req.params.id); res.json({ success: true, data }); } catch (e) { next(e); } };
exports.create = async (req, res, next) => { try { const data = await db.WorkLog.create(req.body); res.status(201).json({ success: true, data }); } catch (e) { next(e); } };
exports.update = async (req, res, next) => { try { await db.WorkLog.update(req.body, { where: { id: req.params.id } }); res.json({ success: true, message: 'Updated' }); } catch (e) { next(e); } };
exports.delete = async (req, res, next) => { try { await db.WorkLog.destroy({ where: { id: req.params.id } }); res.json({ success: true, message: 'Deleted' }); } catch (e) { next(e); } };
