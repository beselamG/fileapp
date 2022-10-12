const { DefaultAzureCredential } = require("@azure/identity");
const {
  BlobServiceClient,
  StorageSharedKeyCredential,
} = require("@azure/storage-blob");
const { dbTest, dbUpload, dbDelete } = require("./dbQuery.js");

require("dotenv").config();
const account = process.env.STOR_ACCOUNT;
const accountKey = process.env.SHARED_KEY;
const sharedKeyCredential = new StorageSharedKeyCredential(account, accountKey);

const blobServiceClient = new BlobServiceClient(
  `https://${account}.blob.core.windows.net`,
  sharedKeyCredential
);

const getContainerList = async function () {
  let i = 1;
  let containers = blobServiceClient.listContainers();
  let cont = [];
  for await (const container of containers) {
    //get blobs in this cont
    let blob = await getBlobList(container.name);

    cont.push({ contName: container.name, blob: blob });
    //console.log(`Container ${i++}: ${container.name}`);
  }
  console.log("CONTAINER ARRAY: ", cont);
  //return object
  return cont;
};

const getBlobList = async function (containerName) {
  console.log("\nListing blobs...");

  const containerClient = blobServiceClient.getContainerClient(containerName);
  //blob properties
  blobArr = [];
  // List the blob(s) in the container.
  for await (const blob of containerClient.listBlobsFlat()) {
    // Get Blob Client from name, to get the URL
    const tempBlockBlobClient = containerClient.getBlockBlobClient(blob.name);
    //put to obj
    let blobObj = { name: "", url: "" };
    blobObj.name = blob.name;
    blobObj.url = tempBlockBlobClient.url;
    blobArr.push(blobObj);
    // Display blob name and URL
    //console.log(`\n\tname: ${blob.name}\n\tURL: ${tempBlockBlobClient.url}\n`);
  }
  // return array of objects
  return await blobArr;
};

const uploadBlob = async function (containerName, blobFile, loacalAccountId) {
  try {
    const containerClient = blobServiceClient.getContainerClient(containerName);
    const blobName = blobFile.originalname;

    const content = blobFile.buffer;
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    const uploadBlobResponse = await blockBlobClient.upload(
      content,
      content.length
    );

    const msg = `Upload block blob ${blobName} successfully`;

    // write into database
    dbUpload(containerName, blobName, loacalAccountId, blockBlobClient.url)
      .then(() => {})
      .catch((err) => {
        console.error(err);
        throw err;
      });

    return msg;
  } catch (err) {
    throw err;
  }
};

const deleteBlob = async function (containerName, blobName) {
  try {
    const options = {
      deleteSnapshots: "include", // or 'only'
    };

    const containerClient = blobServiceClient.getContainerClient(containerName);
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    const deleteBlobResponse = await blockBlobClient.delete(options);

    //delete database record
    dbDelete(containerName, blobName)
      .then(() => {})
      .catch((err) => {
        console.error(err);
        throw err;
      });

    const msg = `Delete block blob ${blobName} successfully`;
    return msg;
  } catch (err) {
    throw err;
  }
};

module.exports = { getContainerList, uploadBlob, deleteBlob };
