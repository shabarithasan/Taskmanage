const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const User = require('../models/user');

function signToken(user) {
  return jwt.sign(
    { sub: user.id, email: user.email, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (User.findByEmail(email)) {
      return res.status(409).json({ error: 'Email already in use.' });
    }

    const hashed = await bcrypt.hash(password, 12);
    const user = User.create({ id: uuidv4(), name, email, password: hashed });
    const token = signToken(user);

    res.status(201).json({ user, token });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = User.findByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    const { password: _, ...safeUser } = user;
    const token = signToken(safeUser);

    res.json({ user: safeUser, token });
  } catch (err) {
    next(err);
  }
};

exports.me = (req, res) => {
  const user = User.findById(req.user.sub);
  if (!user) return res.status(404).json({ error: 'User not found.' });
  res.json({ user });
};
