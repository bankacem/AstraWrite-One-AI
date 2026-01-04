
const request = require('supertest');
const express = require('express');
const dotenv = require('dotenv');

dotenv.config({ path: './.env' }); // Make sure to load env variables for tests

const app = require('../index'); // We need to export app from index.js

describe('Auth Endpoints', () => {
  it('should login successfully with correct credentials', async () => {
    const res = await request(app)
      .post('/api/login')
      .send({
        email: process.env.DEMO_USER,
        password: process.env.DEMO_PASS,
      });
    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
  });

  it('should fail login with incorrect credentials', async () => {
    const res = await request(app)
      .post('/api/login')
      .send({
        email: 'wrong@user.com',
        password: 'wrongpassword',
      });
    expect(res.statusCode).toEqual(401);
    expect(res.body.success).toBe(false);
  });
});
