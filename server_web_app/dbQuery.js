require("dotenv").config();
const sql = require("mssql");
const { getDbConfig } = require("./keyVault");


sql.on("error", (err) => {
  // ... error handler
  throw err;
});

async function dbTest() {
  try {
    const sqlConfig = await getDbConfig();
    let pool = await sql.connect(sqlConfig);
    let result = await pool.request().query("select * from Files");
    return result.recordset;
  } catch (err) {
    // ... error checks
    throw err;
  } finally {
    pool.close();
  }
}

async function dbUpload(containerName, fileName, ownerId, blobUrl) {
  try {
    const sqlConfig = await getDbConfig();
    let pool = await sql.connect(sqlConfig);
    const request = await pool
      .request()
      .input("ContainerName", sql.NVarChar, containerName)
      .input("FileName", sql.NVarChar, fileName)
      .input("OwnerId", sql.NVarChar, ownerId)
      .input("BlobUrl", sql.NVarChar, blobUrl)
      .query(
        "INSERT INTO Files (ContainerName, FileName, OwnerId, BlobUrl) VALUES (@ContainerName, @FileName, @OwnerId, @BlobUrl);"
      );
    // console.log(request);
  } catch (err) {
    // ... error checks
    throw err;
  } finally {
    pool.close();
  }
}

async function dbDelete(containerName, fileName) {
  try {
    const sqlConfig = await getDbConfig();
    let pool = await sql.connect(sqlConfig);
    const request = await pool
      .request()
      .input("ContainerName", sql.NVarChar, containerName)
      .input("FileName", sql.NVarChar, fileName)
      .query(
        "DELETE FROM Files WHERE FileName = @FileName AND ContainerName = @ContainerName;"
      );
  } catch (err) {
    // ... error checks
    throw err;
  } finally {
    pool.close();
  }
}

module.exports = { dbTest, dbUpload, dbDelete };
