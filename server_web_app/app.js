// server/index.js

const cors = require('cors');
const bodyParser = require('body-parser');
const az_identity = require('@azure/identity');
const az_keyvault = require('@azure/keyvault-secrets');
const {
  getContainerList,
  uploadBlob,
  downloadBlob,
  deleteBlob,
  createContainer,
  deleteContainer
} = require('./blobStorage.js');
const { dbTest, dbUpload } = require('./dbQuery.js');

const credentials = new az_identity.DefaultAzureCredential();
const client = new az_keyvault.SecretClient(
  'https://teamaz-key-vault.vault.azure.net/',
  credentials
);

const express = require('express');
const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

app.get("/getFilesByOwnerId/:ownerId", async (req, res) => {

  const files = [];

  const ownerId = req.params.ownerId;
  console.log(ownerId);

  files.push({
    containerName: 'testContainer1',
    fileName: 'testFile1',
    ownerId: 'testUser1',
    blobURL: 'https://file1.url',
  });

  files.push({
    containerName: 'testContainer2',
    fileName: 'testFile2',
    ownerId: 'testUser2',
    blobURL: 'https://file2.url',
  });

  files.push({
    containerName: 'testContainer3',
    fileName: 'testFile3',
    ownerId: 'testUser3',
    blobURL: 'https://file3.url',
  });

  res.send(files);
});

// add test comment
app.get('/dbTest', async (req, res) => {
  dbTest()
    .then((results) => {
      res.send(results);
    })
    .catch((err) => {
      console.error(err);
    });
});

app.post('/dbUpload', async (req, res) => {
  var containerName = req.body.containerName;
  containerName = 'class1';
  const fileName = req.body.fileName;
  const ownerId = req.body.ownerId;
  const blobUrl = req.body.blobUrl;

  //Upload in require('./blobStorage.js');
  dbUpload(containerName, fileName, ownerId, blobUrl)
    .then((msg) => {
      console.log(msg);
      res.send(msg);
    })
    .catch((err) => {
      console.error(err);
      res.status(400).send('Something went wrong!');
    });
});

app.post('/createContainer', async (req, res) => {
  const containerName = req.body.containerName;
  console.log("CREATE NAME: ", containerName);
  createContainer(containerName)
    .then((msg) => {
      console.log(msg);
      res.send(msg);
    })
    .catch((err) => {
      console.error(err);
      res.status(400).send('Something went wrong!');
    });
})
app.post('/deleteContainer', async (req, res) => {
  const containerName = req.body.containerName;
  console.log("DELETE NAME: ", containerName);
  deleteContainer(containerName)
    .then((msg) => {
      console.log(msg);
      res.send(msg);
    })
    .catch((err) => {
      console.error(err);
      res.status(400).send('Something went wrong!');
    });
})

app.post('/dbDelele', async (req, res) => {
  const containerName = req.body.containerName;
  const fileName = req.body.fileName;

  deleteBlob(containerName, fileName)
    .then((msg) => {
      console.log(msg);
      res.send(msg);
    })
    .catch((err) => {
      console.error(err);
      res.status(400).send('Something went wrong!');
    });
});

app.get('/getContainer', async (req, res) => {
  const blobs = await getContainerList();
  res.send(blobs);
});

//Multer parses form data
let multer = require('multer');
let upload = multer().single('file');
app.post('/upload', (req, res) => {
  upload(req, res, (err) => {
    if (err) {
      res.status(400).send('Something went wrong!');
    }



    uploadBlob(req.body.containerName, req.file, req.body.localAccountId, req.body.exists)
      .then((msg) => {
        console.log(msg);
        res.send(msg);
      })
      .catch((err) => {
        console.error(err);
        res.status(400).send('Something went wrong!');
      });
  });
});

// download blob and send it back as stream
app.post('/download', (req, res) => {
  const containerName = req.body.containerName;
  const fileName = req.body.fileName;
  downloadBlob(containerName, fileName, res);
})

app.get('/key', (req, res) => {
  client
    .getSecret('SHARED-KEY')
    .then((ress) => {
      console.log('resss', ress, ress.name, ress.body);
      const key_value = ress.value;
      res.json({ key_name: key_value });
    })
    .catch((e) => {
      console.log(e);
      res.json({ key_v: false });
    });
});

app.get('/', (req, res) => {
  res.json({ hello: 'hello' });
});

module.exports = app;
