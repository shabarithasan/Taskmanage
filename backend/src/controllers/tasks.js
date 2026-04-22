const { v4: uuidv4 } = require('uuid');
const Task = require('../models/task');

exports.list = (req, res, next) => {
  try {
    const { status, priority, page, limit } = req.query;
    const result = Task.findAll({ userId: req.user.sub, status, priority, page, limit });

    res.json({
      data: result.rows,
      meta: {
        total: result.total,
        page:  result.page,
        limit: result.limit,
        pages: Math.ceil(result.total / result.limit),
      },
    });
  } catch (err) { next(err); }
};

exports.create = (req, res, next) => {
  try {
    const { title, description, status, priority, due_date } = req.body;
    const task = Task.create({
      id: uuidv4(),
      userId: req.user.sub,
      title, description,
      status:   status   || 'todo',
      priority: priority || 'medium',
      due_date,
    });
    res.status(201).json({ data: task });
  } catch (err) { next(err); }
};

exports.get = (req, res, next) => {
  try {
    const task = Task.findOne(req.params.id, req.user.sub);
    if (!task) return res.status(404).json({ error: 'Task not found.' });
    res.json({ data: task });
  } catch (err) { next(err); }
};

exports.update = (req, res, next) => {
  try {
    const exists = Task.findOne(req.params.id, req.user.sub);
    if (!exists) return res.status(404).json({ error: 'Task not found.' });

    const task = Task.update(req.params.id, req.user.sub, req.body);
    res.json({ data: task });
  } catch (err) { next(err); }
};

exports.remove = (req, res, next) => {
  try {
    const deleted = Task.delete(req.params.id, req.user.sub);
    if (!deleted) return res.status(404).json({ error: 'Task not found.' });
    res.status(204).end();
  } catch (err) { next(err); }
};
