require('dotenv').config();
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const db = require('../src/config/database');

// Run migrations first
require('../migrations/run');

// ---------------------------------------------------------------------------
// Seed users
// ---------------------------------------------------------------------------
const password = bcrypt.hashSync('Password123!', 10);

const users = [
  { id: uuidv4(), name: 'Alice Demo',   email: 'alice@example.com', password },
  { id: uuidv4(), name: 'Bob Tester',   email: 'bob@example.com',   password },
];

const insertUser = db.prepare(`
  INSERT OR IGNORE INTO users (id, name, email, password)
  VALUES (@id, @name, @email, @password)
`);

for (const u of users) insertUser.run(u);

// ---------------------------------------------------------------------------
// Seed tasks for Alice
// ---------------------------------------------------------------------------
const [alice] = users;

const tasks = [
  {
    id: uuidv4(), user_id: alice.id,
    title: 'Set up CI pipeline',
    description: 'Configure GitHub Actions for lint, test, and build steps.',
    status: 'done', priority: 'high', due_date: '2025-06-01',
  },
  {
    id: uuidv4(), user_id: alice.id,
    title: 'Write API documentation',
    description: 'Document all REST endpoints using OpenAPI 3.0 spec.',
    status: 'in_progress', priority: 'medium', due_date: '2025-06-15',
  },
  {
    id: uuidv4(), user_id: alice.id,
    title: 'Add end-to-end tests',
    description: 'Use Playwright to cover the happy path for auth and tasks.',
    status: 'todo', priority: 'medium', due_date: '2025-06-30',
  },
  {
    id: uuidv4(), user_id: alice.id,
    title: 'Performance audit',
    description: 'Run Lighthouse and address any score < 90.',
    status: 'todo', priority: 'low', due_date: null,
  },
];

const insertTask = db.prepare(`
  INSERT OR IGNORE INTO tasks (id, user_id, title, description, status, priority, due_date)
  VALUES (@id, @user_id, @title, @description, @status, @priority, @due_date)
`);

for (const t of tasks) insertTask.run(t);

console.log(`✅  Seeded ${users.length} users and ${tasks.length} tasks.`);
console.log('   Login with alice@example.com / Password123!');
