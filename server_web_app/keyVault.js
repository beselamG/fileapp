const az_identity = require("@azure/identity");
const az_keyvault = require("@azure/keyvault-secrets");
const { BlobServiceClient, StorageSharedKeyCredential } = require("@azure/storage-blob");

const credentials = new az_identity.DefaultAzureCredential();
const client = new az_keyvault.SecretClient(
    "https://teamaz-key-vault.vault.azure.net/",
    credentials
  );
var blobServiceClientt = null;
var sqlConfig = null;



const getBlobService = async function () {

    if (blobServiceClientt == null) {
      const storageAccount = (await client.getSecret("STOR-ACCOUNT")).value;
      const accountKey = (await client.getSecret("SHARED-KEY")).value;
      const sharedKeyCredential = new StorageSharedKeyCredential(
        storageAccount,
        accountKey
      );
  
      blobServiceClientt = new BlobServiceClient(
        `https://${
            storageAccount
        }.blob.core.windows.net`,
        sharedKeyCredential
      );
      return blobServiceClientt;
    } else {
      console.log("called but we have");
      return blobServiceClientt;
    }
  };

  const getDbConfig = async function () {
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

  module.exports = { getBlobService, getDbConfig };