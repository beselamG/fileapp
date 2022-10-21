const request = require('supertest');
const app = require('./app.js');

describe('GET', () => {
  // test db test whether return
  // 200 status code
  // { hello: 'hello' }
  it('test /', async () => {
    await request(app)
      .get('/')
      .expect(200)
      .expect({ hello: 'hello' })
  });

});
