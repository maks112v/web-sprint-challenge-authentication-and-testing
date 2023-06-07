const request = require('supertest');
const app = require('./server');
const testDb = require('../data/dbConfig');

beforeAll(async () => {
  await testDb.migrate.latest();
});

afterAll(async () => {
  await testDb.migrate.rollback();
  await testDb.destroy();
});

describe('Register Endpoint', () => {
  it('should register a new user when valid username and password are provided', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({ username: 'new_user', password: 'password123' });

    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty('id');
    expect(response.body).toHaveProperty('username', 'new_user');
    expect(response.body).toHaveProperty('password');
  });

  it('should return an error when a duplicate username is provided', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({ username: 'new_user', password: 'password123' });

    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty('message', 'username taken');
  });
});

describe('Login Endpoint', () => {
  it('should return a token when valid credentials are provided', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({ username: 'example_user', password: 'password123' });

    const response = await request(app)
      .post('/api/auth/login')
      .send({ username: 'example_user', password: 'password123' });

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('message', 'welcome, example_user');
    expect(response.body).toHaveProperty('token');
  });

  it('should return an error when invalid credentials are provided', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ username: 'example_user', password: 'wrong_password' });

    expect(response.statusCode).toBe(401);
    expect(response.body).toHaveProperty('message', 'invalid credentials');
  });
});

describe('Jokes Endpoint', () => {
  it('should return a list of jokes when a valid token is provided', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({ username: 'new_user', password: 'password123' });
    const {
      body: { token },
    } = await request(app)
      .post('/api/auth/login')
      .send({ username: 'new_user', password: 'password123' });

    const response = await request(app)
      .get('/api/jokes')
      .set('Authorization', `Bearer ${token}`);

    expect(response.statusCode).toBe(200);
    expect(response.body).toBeInstanceOf(Array);
  });

  it('should return an error when an invalid token is provided', async () => {
    const response = await request(app)
      .get('/api/jokes')
      .set('Authorization', 'Bearer YOUR_INVALID_TOKEN');

    expect(response.statusCode).toBe(401);
    expect(response.body).toHaveProperty('message', 'token invalid');
  });
});
