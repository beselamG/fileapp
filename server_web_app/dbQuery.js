require('dotenv').config();
const sql = require('mssql');
const { getDbConfig } = require('./keyVault');

sql.on('error', (err) => {
  // ... error handler
  throw err;
});

async function dbAll(testConfig) {
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

async function dbQueryFileName(queryFileName, testConfig) {
  const prodConfig = await getDbConfig();
  const config = testConfig || prodConfig;
  const pool = await sql.connect(config);
  try {
    let result = await pool
      .request()
      .input('FileName', sql.NVarChar, `%${queryFileName}%`)
      .query('SELECT * FROM Files WHERE FileName LIKE @FileName;');

    console.log(result);
    
    return result.recordset;
  } catch (err) {
    // ... error checks
    throw err;
  } finally {
    pool.close();
  }
}

async function dbUpload(containerName, fileName, ownerId, blobUrl, dateTime, testConfig) {
  const prodConfig = await getDbConfig();
  const config = testConfig || prodConfig;
  const updateTime = "N/A"

  const pool = await sql.connect(config);
  try {
    await pool
      .request()
      .input('ContainerName', sql.NVarChar, containerName)
      .input('FileName', sql.NVarChar, fileName)
      .input('OwnerId', sql.NVarChar, ownerId)
      .input('BlobUrl', sql.NVarChar, blobUrl)
      .input('UploadTime', sql.NVarChar, dateTime)
      .input('UpdateTime', sql.NVarChar, updateTime)
      .query(
        'INSERT INTO Files (ContainerName, FileName, OwnerId, BlobUrl, UploadTime, UpdateTime) VALUES (@ContainerName, @FileName, @OwnerId, @BlobUrl, @UploadTime, @UpdateTime);'
      );
    // console.log(request);
  } catch (err) {
    // ... error checks
    throw err;
  } finally {
    pool.close();
  }
}
async function dbUpdate(containerName, fileName, ownerId, blobUrl, dateTime, testConfig) {
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
      .input('UpdateTime', sql.NVarChar, dateTime)
      .query(
        'UPDATE Files SET ContainerName=@ContainerName, FileName=@FileName, OwnerId=@OwnerId, BlobUrl=@BlobUrl, UpdateTime=@UpdateTime WHERE FileName = @FileName AND ContainerName = @ContainerName;'
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

module.exports = { dbAll, dbUpload, dbDeleteFile, dbDeleteContainer, dbUpdate, dbQueryFileName };