const request = require('supertest');
const app = require('./app.js');

describe('GET /dbTest', () => {
  // test db test whether return
  // 200 status code
  // json
  it('test dbTest', async () => {
    await request(app)
      .get('/dbTest')
  });

});
