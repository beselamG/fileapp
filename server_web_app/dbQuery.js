require("dotenv").config();
const sql = require("mssql");
const az_identity = require("@azure/identity");
const az_keyvault = require("@azure/keyvault-secrets");
var sqlConfig = null;
const credentials = new az_identity.DefaultAzureCredential();
const client = new az_keyvault.SecretClient(
  "https://teamaz-key-vault.vault.azure.net/",
  credentials
);


const getConfig = async function () {
  if (sqlConfig == null) {
    const dbUser = (await client.getSecret("SQL-USERNAME")).value;
    const dbPassword = (await client.getSecret("SQL-PASSWORD")).value;
    const db = (await client.getSecret("SQL-DATABASE")).value;
    const server = (await client.getSecret("SQL-SERVER")).value;

    const sqlConfig = {
      user: dbUser,
      password: dbPassword,
      database: db,
      server: server,
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
    return sqlConfig;
  } else {
    return sqlConfig;
  }
};

sql.on("error", (err) => {
  // ... error handler
  throw err;
});

async function dbTest() {
  try {
    const sqlConfig = await getConfig();
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
    const sqlConfig = await getConfig();
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
    const sqlConfig = await getConfig();
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
