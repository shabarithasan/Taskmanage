const db = require('../config/database');

const User = {
  findByEmail(email) {
    return db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  },

  findById(id) {
    return db.prepare('SELECT id, name, email, created_at FROM users WHERE id = ?').get(id);
  },

  create({ id, name, email, password }) {
    db.prepare(`
      INSERT INTO users (id, name, email, password) VALUES (?, ?, ?, ?)
    `).run(id, name, email, password);
    return User.findById(id);
  },
};

module.exports = User;
