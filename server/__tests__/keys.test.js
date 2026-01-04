
const request = require('supertest');
const app = require('../index');
const db = require('../index').db; // We need to export db from index.js for this to work

describe('API Key Management Endpoints', () => {
  let cookie;

  beforeAll(async () => {
    const res = await request(app)
      .post('/api/login')
      .send({ email: process.env.DEMO_USER, password: process.env.DEMO_PASS });
    cookie = res.headers['set-cookie'];
  });

  beforeEach(async () => {
    // This is a simplified way to clear the DB for tests.
    // In a real app, you might use a separate test DB or more robust seeding.
    await new Promise((resolve) => db.remove({}, { multi: true }, resolve));
  });

  it('should get an empty list of keys', async () => {
    const res = await request(app)
      .get('/api/keys')
      .set('Cookie', cookie);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual([]);
  });

  it('should create a new key', async () => {
    const res = await request(app)
      .post('/api/keys')
      .set('Cookie', cookie)
      .send({ label: 'Test Key', key: 'test-key', provider: 'GEMINI' });
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('label', 'Test Key');
  });

  it('should get a list with one key', async () => {
    await request(app)
      .post('/api/keys')
      .set('Cookie', cookie)
      .send({ label: 'Test Key', key: 'test-key', provider: 'GEMINI' });

    const res = await request(app)
      .get('/api/keys')
      .set('Cookie', cookie);
    expect(res.statusCode).toEqual(200);
    expect(res.body.length).toBe(1);
    expect(res.body[0].label).toBe('Test Key');
  });
});
