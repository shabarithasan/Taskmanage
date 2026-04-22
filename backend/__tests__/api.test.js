process.env.DB_PATH = ':memory:';
process.env.JWT_SECRET = 'test-secret-do-not-use';
process.env.NODE_ENV = 'test';

const request = require('supertest');
const app = require('../src/index');

let token;
let taskId;

describe('Auth', () => {
  const user = { name: 'Test User', email: 'test@example.com', password: 'Password123!' };

  test('POST /api/auth/register – creates a user', async () => {
    const res = await request(app).post('/api/auth/register').send(user);
    expect(res.status).toBe(201);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe(user.email);
    token = res.body.token;
  });

  test('POST /api/auth/register – rejects duplicate email', async () => {
    const res = await request(app).post('/api/auth/register').send(user);
    expect(res.status).toBe(409);
  });

  test('POST /api/auth/login – returns token', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: user.email, password: user.password,
    });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  test('POST /api/auth/login – rejects wrong password', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: user.email, password: 'WrongPass999',
    });
    expect(res.status).toBe(401);
  });

  test('GET /api/auth/me – returns authenticated user', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe(user.email);
  });
});

describe('Tasks CRUD', () => {
  const auth = () => token ? { Authorization: `Bearer ${token}` } : {};

  test('GET /api/tasks – returns empty list', async () => {
    const res = await request(app).get('/api/tasks').set(auth());
    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([]);
  });

  test('POST /api/tasks – creates a task', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .set(auth())
      .send({ title: 'First task', priority: 'high' });
    expect(res.status).toBe(201);
    expect(res.body.data.title).toBe('First task');
    taskId = res.body.data.id;
  });

  test('GET /api/tasks/:id – retrieves a task', async () => {
    const res = await request(app).get(`/api/tasks/${taskId}`).set(auth());
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(taskId);
  });

  test('PATCH /api/tasks/:id – updates a task', async () => {
    const res = await request(app)
      .patch(`/api/tasks/${taskId}`)
      .set(auth())
      .send({ status: 'done' });
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('done');
  });

  test('DELETE /api/tasks/:id – removes a task', async () => {
    const res = await request(app).delete(`/api/tasks/${taskId}`).set(auth());
    expect(res.status).toBe(204);
  });

  test('GET /api/tasks/:id – 404 after delete', async () => {
    const res = await request(app).get(`/api/tasks/${taskId}`).set(auth());
    expect(res.status).toBe(404);
  });

  test('GET /api/tasks – requires auth', async () => {
    const res = await request(app).get('/api/tasks');
    expect(res.status).toBe(401);
  });
});
