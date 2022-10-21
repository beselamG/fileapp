require('dotenv').config();
const sql = require('mssql');
const { getDbConfig } = require('./keyVault');

sql.on('error', (err) => {
  // ... error handler
  throw err;
});

async function dbTest(testConfig) {
  const prodConfig = await getDbConfig();
  const config = testConfig || prodConfig;
  const pool = await sql.connect(config);
  try {
    let result = await pool.request().query('select * from Files');
    return result.recordset;
  } catch (err) {
    // ... error checks
    throw err;
  } finally {
    pool.close();
  }
}

async function dbUpload(containerName, fileName, ownerId, blobUrl, testConfig) {
  const prodConfig = await getDbConfig();
  const config = testConfig || prodConfig;

  const pool = await sql.connect(config);
  try {
    await pool
      .request()
      .input('ContainerName', sql.NVarChar, containerName)
      .input('FileName', sql.NVarChar, fileName)
      .input('OwnerId', sql.NVarChar, ownerId)
      .input('BlobUrl', sql.NVarChar, blobUrl)
      .query(
        'INSERT INTO Files (ContainerName, FileName, OwnerId, BlobUrl) VALUES (@ContainerName, @FileName, @OwnerId, @BlobUrl);'
      );
    // console.log(request);
  } catch (err) {
    // ... error checks
    throw err;
  } finally {
    pool.close();
  }
}

async function dbDeleteFile(containerName, fileName, testConfig) {
  const prodConfig = await getDbConfig();
  const config = testConfig || prodConfig;

  const pool = await sql.connect(config);
  try {
    await pool
      .request()
      .input('ContainerName', sql.NVarChar, containerName)
      .input('FileName', sql.NVarChar, fileName)
      .query(
        'DELETE FROM Files WHERE FileName = @FileName AND ContainerName = @ContainerName;'
      );
  } catch (err) {
    console.log(err);
    // ... error checks
    throw err;
  } finally {
    pool.close();
  }
}

async function dbDeleteContainer(containerName, testConfig) {
  const prodConfig = await getDbConfig();
  const config = testConfig || prodConfig;

  const pool = await sql.connect(config);
  try {
    await pool
      .request()
      .input('ContainerName', sql.NVarChar, containerName)
      .query(
        'DELETE FROM Files WHERE ContainerName = @ContainerName;'
      );
  } catch (err) {
    console.log(err);
    // ... error checks
    throw err;
  } finally {
    pool.close();
  }
}

module.exports = { dbTest, dbUpload, dbDeleteFile, dbDeleteContainer };