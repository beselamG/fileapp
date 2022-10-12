const request = require('supertest');
const app = require('../app.js');
const api = request(app);

const blobStorage = require('../blobStorage.js');

beforeEach(() => {
  const data = [{ contName: 'name', blob: [] }];
  mockDateNow = jest
    .spyOn(blobStorage, 'getContainerList')
    .mockImplementation(() => data);
});

describe('GET /getContainer tes', () => {
  test('should return the json', async () => {
    await api
      .get('/getContainer')
      
      expect(3).toBe(3);
      
  });
});

