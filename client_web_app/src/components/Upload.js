import React, { useContext } from 'react';
import { useState, useEffect } from 'react';
import { useBlobs, useBlobsUpdate } from './BlobContext.js';
import axios from 'axios';
import DisplayFiles from './DisplayFiles';
import { useMsal } from '@azure/msal-react';
import { hasBlobWrite, hasBlobRead } from './rbac';
import { AppConfigContext } from '../AppConfigContext';
import { Collapse } from 'react-collapse';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import blobs from './blobs';




export default function Upload({ localAccountId }) {
  const [file, setFile] = useState();
  const [uploaded, setUploaded] = useState(false);
  const [containers, setContainer] = useState([]);
  const [selectedContainer, setSelectedContainer] = useState();
  const [apiUrl] = useContext(AppConfigContext);
  const [containerName, setContainerName] = useState('');
  const [containerDeleteName, setContainerDeleteName] = useState('');
  const [refreshContainer, setRefreshContainer] = useState(true);
  const [createContainerOpen, setCreateContainerOpen] = useState(false);
  const [deleteContainerOpen, setDeleteContainerOpen] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const blob = useBlobs();
  const blobUpdate = useBlobsUpdate();


  // retrieve account roles
  const { instance } = useMsal();

  //Handle file selection
  function handleFileChange(event) {
    setFile(event.target.files[0]);
  }
  function handleContainerChange(event) {
    setContainerName(event.target.value);
  }
  //handle container dropdown select
  const handleContainerSelect = (event) => {
    console.log('Handle select');
    setSelectedContainer(event.target.value);

  };
  //handle container removal dropdown select
  const handleContainerDeleteSelect = (event) => {
    console.log('Handle delete select');
    setContainerDeleteName(event.target.value);

  };


  //Get all containers here when signed in and when new container is created
  useEffect(() => {
    // if has write permission
    if (hasBlobWrite(instance)) {
      blobs.getContainer(apiUrl).then(conts => {
        setContainer(conts);
        setSelectedContainer(conts[0].contName);
        setContainerDeleteName(conts[0].contName);

      });
      //otherwise no write permission
    } else {
      setContainer([]);
    }
  }, [localAccountId, refreshContainer]);

  const fileExists = () => {
    //GET blobs and compare if same container/blob match
    //Search all blob URLs => compare to would be url end with container/file
    const urlEnd = `/${selectedContainer}/${file.name}`;
    const result = blob.filter(b =>
      b.BlobURL.toLowerCase().includes(urlEnd)
    );
    console.log('MATCH:', result);
    if (result.length > 0) return true;
    else return false;
  };


  //Handle submit and post file to /upload API
  async function handleFileSubmit(event) {
    event.preventDefault();
    setUploaded(false);
    //Check if file exist in that container
    const exists = fileExists();
    if (exists) {
      console.log('EXISTS');

      //If it exist you can choose if replace the previous or not upload
      if (window.confirm(`This file name "${file.name}" allready exist in container "${selectedContainer}"
                          \n\tChoose OK to replace the current file.\n\t Press Cancel to not upload`)) {
        blobs.uploadBlob(apiUrl, file, localAccountId, selectedContainer, exists).then(() => {
          setUploaded(true);
        }).catch(err => {
          alert('Upload Error' + err.toString());
        });

      } else {
        // Do nothing if alert window select close!
        console.log('Not uploaded');
      }
    }
    //If file does not exist it uploads
    else {
      console.log('DOES NOT EXIST');
      blobs.uploadBlob(apiUrl, file, localAccountId, selectedContainer, exists).then(() => {
        setUploaded(true);
      }).catch(err => {
        alert('Upload Error' + err.toString());
      });
    }
  }


  //Handle container create submit and make axios post requiest to /createContainer API
  async function handleContainerCreateSubmit(event) {
    event.preventDefault();
    const url = `${apiUrl}/createContainer`;
    const body = { containerName: containerName };
    axios.post(url, body)
      .then(response => {
        console.log(response);
        setContainerName('');
        setRefreshContainer(!refreshContainer);
      }).then(() => {
        alert('Container created: ' + containerName.toString());
      }).catch(err => {
        alert('Container Create Error' + err.toString() +
          '\nCheck that name is atleast 3 chars no special charachters or it exists');
      });
  }

  //Handle container delete submit and make axios post requiest to /deleteContainer API
  async function handleContainerDeleteSubmit(event) {
    setUploaded(false);
    event.preventDefault();
    const url = `${apiUrl}/deleteContainer`;
    const body = { containerName: containerDeleteName };
    if (window.confirm(`Do you want to delete this container ${containerName}? All files inside container fill be deleted`)) {
      axios.post(url, body)
        .then(response => {
          blobUpdate(apiUrl);
          console.log(response);
          setContainerDeleteName('');
          setRefreshContainer(!refreshContainer);
        }).catch(err => {
          alert('Container Delete Error' + err.toString());
        });

    } else {
      // Do nothing if alert window select close!
      console.log('Not deleted');
    }

  }

  const createContainerToggle = () => {
    setCreateContainerOpen(createContainerOpen => !createContainerOpen);
  };
  const deleteContainerToggle = () => {
    setDeleteContainerOpen(deleteContainerOpen => !deleteContainerOpen);
  };
  const uploadToggle = () => {
    setUploadOpen(uploadOpen => !uploadOpen);
  };



  // if has write permission
  if (hasBlobWrite(instance)) {
    return (

      <>
        <div className='uploadMain'>
          {/* ADD CONTAINERS should add Admin permission for this*/}
          <button className="adminButton" onClick={createContainerToggle}>Create Container - Requires Writer Role
            {createContainerOpen ? <ArrowDownwardIcon /> : <ArrowForwardIcon />}</button>
          <Collapse isOpened={createContainerOpen}>
            <div>
              <form className="containerForm" onSubmit={handleContainerCreateSubmit}>
                <h2>Create Container</h2>
                <label style={{ paddingBottom: 10 }}>Type Container Name</label>
                <input type="text"
                  value={containerName}
                  onChange={handleContainerChange}
                  style={{ marginBottom: 10 }} />
                <button className='formButton' type="submit">Create</button>
              </form>
            </div>
          </Collapse>

          {/* DELETE CONTAINERS should add Admin permission for this*/}
          <button className="adminButton" onClick={deleteContainerToggle}>Delete Container - Requires Writer Role
            {deleteContainerOpen ? <ArrowDownwardIcon /> : <ArrowForwardIcon />}</button>
          <Collapse isOpened={deleteContainerOpen}>
            <div>
              <form className="containerForm" onSubmit={handleContainerDeleteSubmit}>
                <h2>Delete Container</h2>
                <label style={{ paddingBottom: 10 }}>Select Container to be removed</label>
                <select
                  style={{ marginBottom: 10 }}
                  onChange={handleContainerDeleteSelect}
                  value={containerDeleteName}>
                  {containers.map((x, i) =>
                    <option key={i} value={x.contName}>{x.contName}</option>
                  )}
                </select>
                <button className='formButton' type="submit">Delete</button>
              </form>
            </div>
          </Collapse>



          {/* UPLOAD FORM */}
          <button className="adminButton" onClick={uploadToggle}>Upload File - Requires Writer Role
            {uploadOpen ? <ArrowDownwardIcon /> : <ArrowForwardIcon />}</button>
          <Collapse isOpened={uploadOpen}>
            <div>
              <form className="uploadForm" onSubmit={handleFileSubmit} >
                <h2>File Upload</h2>
                <label style={{ paddingBottom: 10 }}>Choose a Conainer</label>
                <select
                  style={{ marginBottom: 10 }}
                  onChange={handleContainerSelect}
                  value={selectedContainer}>
                  {containers.map((x, i) =>
                    <option key={i} value={x.contName}>{x.contName}</option>
                  )}
                </select>
                <input encType="multipart/form-data" name="file" type="file"
                  onChange={handleFileChange}
                  style={{ marginBottom: 10 }} />
                <button className='formButton' type="submit">Upload</button>
              </form>
            </div>
          </Collapse>


        </div>
        <DisplayFiles uploaded={uploaded} localAccountId={localAccountId} />
      </>

    );
    // otherwise no write permission
  } else {
    return (
      <>
        <div className="App" >
          <h1>You have no permission to create files or containers!</h1>
        </div>
        <DisplayFiles uploaded={uploaded} localAccountId={localAccountId} />
      </>
    );
  }

}