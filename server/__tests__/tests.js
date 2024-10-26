const { expect } = require('@jest/globals');
const supertest = require('supertest');
const app = require('../server');

const results = require("./results.json")

test('GET /author/name', async () => {
  await supertest(app).get('/author/name')
    .expect(200)
    .then((res) => {
      expect(res.body.data).not.toEqual("something");
    });
});
