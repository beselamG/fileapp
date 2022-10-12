const dbQuery = require('./dbQuery.js');

describe('test sql operations', () => {
  const testConfig = {
    user: process.env.TEST_SQL_USERNAME,
    password: process.env.TEST_SQL_PASSWORD,
    database: process.env.TEST_SQL_DATABASE,
    server: process.env.TEST_SQL_SERVER,
    pool: {
      max: 10,
      min: 0,
      idleTimeoutMillis: 30000,
    },
    options: {
      encrypt: true, // for azure
      trustServerCertificate: false, // change to true for local dev / self-signed certs
    },
  };

  it('', async () => {
    //const results = await dbQuery.dbTest(testConfig);
    expect(3).toBe(3);
  });
});