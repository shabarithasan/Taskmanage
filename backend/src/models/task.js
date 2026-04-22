const db = require('../config/database');

const Task = {
  findAll({ userId, status, priority, page = 1, limit = 20 }) {
    const offset = (page - 1) * limit;
    const conditions = ['user_id = @userId'];
    const params = { userId, limit, offset };

    if (status)   { conditions.push('status = @status');     params.status   = status;   }
    if (priority) { conditions.push('priority = @priority'); params.priority = priority; }

    const where = conditions.join(' AND ');

    const rows = db.prepare(`
      SELECT * FROM tasks WHERE ${where}
      ORDER BY
        CASE priority WHEN 'high' THEN 1 WHEN 'medium' THEN 2 ELSE 3 END,
        created_at DESC
      LIMIT @limit OFFSET @offset
    `).all(params);

    const { total } = db.prepare(
      `SELECT COUNT(*) AS total FROM tasks WHERE ${where}`
    ).get(params);

    return { rows, total, page: Number(page), limit: Number(limit) };
  },

  findOne(id, userId) {
    return db.prepare('SELECT * FROM tasks WHERE id = ? AND user_id = ?').get(id, userId);
  },

  create({ id, userId, title, description, status, priority, due_date }) {
    db.prepare(`
      INSERT INTO tasks (id, user_id, title, description, status, priority, due_date)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(id, userId, title, description ?? null, status, priority, due_date ?? null);
    return Task.findOne(id, userId);
  },

  update(id, userId, fields) {
    const allowed = ['title', 'description', 'status', 'priority', 'due_date'];
    const updates = Object.keys(fields)
      .filter(k => allowed.includes(k))
      .map(k => `${k} = @${k}`)
      .join(', ');

    if (!updates) return Task.findOne(id, userId);

    db.prepare(`
      UPDATE tasks SET ${updates}, updated_at = datetime('now')
      WHERE id = @id AND user_id = @userId
    `).run({ ...fields, id, userId });

    return Task.findOne(id, userId);
  },

  delete(id, userId) {
    const info = db.prepare(
      'DELETE FROM tasks WHERE id = ? AND user_id = ?'
    ).run(id, userId);
    return info.changes > 0;
  },
};

module.exports = Task;
