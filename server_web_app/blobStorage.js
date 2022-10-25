const { getBlobService } = require('./keyVault');
const { dbTest, dbUpdate, dbUpload, dbDeleteFile, dbDeleteContainer } = require('./dbQuery.js');



const getContainerList = async function () {
  const bloService = await getBlobService();
  let containers = bloService.listContainers();
  let cont = [];
  for await (const container of containers) {
    //get blobs in this cont
    let blob = await getBlobList(container.name);

    cont.push({ contName: container.name, blob: blob });
    //console.log(`Container ${i++}: ${container.name}`);
  }
  console.log('CONTAINER ARRAY: ', cont);
  //return object
  return cont;
};

const getBlobList = async function (containerName) {
  const blobService = await getBlobService();

  console.log('\nListing blobs...');

  const containerClient = blobService.getContainerClient(containerName);
  //blob properties
  blobArr = [];
  // List the blob(s) in the container.
  for await (const blob of containerClient.listBlobsFlat()) {
    // Get Blob Client from name, to get the URL
    const tempBlockBlobClient = containerClient.getBlockBlobClient(blob.name);
    //put to obj
    let blobObj = { name: '', url: '' };
    blobObj.name = blob.name;
    blobObj.url = tempBlockBlobClient.url;
    blobArr.push(blobObj);
    // Display blob name and URL
    //console.log(`\n\tname: ${blob.name}\n\tURL: ${tempBlockBlobClient.url}\n`);
  }
  // return array of objects
  return await blobArr;
};

const createContainer = async function (containerName) {
  try {
    const blobService = await getBlobService();
    // Get a reference to a container
    const containerClient = blobService.getContainerClient(containerName);
    // Create the container
    const createContainerResponse = await containerClient.create();
    const msg = `Container was created successfully.\n\trequestId:${createContainerResponse.requestId}\n\tURL: ${containerClient.url}`;
    return msg
  } catch (err) {
    throw (err);
  }

}
const deleteContainer = async function (containerName) {
  try {
    const blobService = await getBlobService();
    // Get a reference to a container
    const response = await blobService.deleteContainer(containerName);

    //delete database record
    dbDeleteContainer(containerName)
      .then(() => { })
      .catch((err) => {
        console.error(err);
        throw err;
      });

    const msg = `deleted ${containerName} container`;
    return msg
  } catch (err) {
    throw (err);
  }

}

const uploadBlob = async function (containerName, blobFile, loacalAccountId, exists) {
  try {
    const blobService = await getBlobService();
    const containerClient = blobService.getContainerClient(containerName);
    const blobName = blobFile.originalname;

    const content = blobFile.buffer;
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    await blockBlobClient.upload(
      content,
      content.length
    );

    const msg = `Upload block blob ${blobName} successfully`;
    const dateTime = new Date().toISOString().
      replace(/T/, ' ').      // replace T with a space
      replace(/\..+/, '')     // delete the dot and everything after
    console.log(dateTime);
    // write into database
    console.log('EXISTS VALUE', exists);
    if (exists == 'true') {
      console.log("FILE EXISTS");
      console.log('EXISTS');
      dbUpdate(containerName, blobName, loacalAccountId, blockBlobClient.url, dateTime)
        .then(() => { })
        .catch((err) => {
          console.error(err);
          throw err;
        });
    } else {
      console.log('DOES NOT EXIST');
      dbUpload(containerName, blobName, loacalAccountId, blockBlobClient.url, dateTime)
        .then(() => { })
        .catch((err) => {
          console.error(err);
          throw err;
        });
    }


    return msg;
  } catch (err) {
    throw err;
  }
};

const deleteBlob = async function (containerName, blobName) {
  try {
    const options = {
      deleteSnapshots: 'include', // or 'only'
    };
    const blobService = await getBlobService();
    const containerClient = blobService.getContainerClient(containerName);
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    await blockBlobClient.delete(options);

    //delete database record
    dbDeleteFile(containerName, blobName)
      .then(() => { })
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

module.exports = { getContainerList, uploadBlob, deleteBlob, createContainer, deleteContainer };
