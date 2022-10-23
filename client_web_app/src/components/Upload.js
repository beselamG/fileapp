import React, { useContext } from 'react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import DisplayFiles from './DisplayFiles';
import blobs from './blobs';
import { useMsal } from '@azure/msal-react';
import { hasBlobWrite, hasBlobRead } from './rbac';
import { AppConfigContext } from '../AppConfigContext';
import { Collapse } from 'react-collapse';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';



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


  //Handle submit and post file to api
  async function handleFileSubmit(event) {
    event.preventDefault();
    setUploaded(false);
    const url = `${apiUrl}/upload`;
    console.log(file);
    let formData = new FormData();
    formData.append('localAccountId', localAccountId);
    formData.append('file', file);
    formData.append('containerName', selectedContainer);
    console.log(formData);
    await axios({
      method: 'post',
      url: url,
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      }
    }).then(results => {
      alert(JSON.stringify(results.data));
      setUploaded(true);
    }).catch(err => {
      alert('Upload Error');
    });

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
      }).catch(err => {
        alert('Container Create Error', err);
      });
  }

  //Handle container delete submit and make axios post requiest to /deleteContainer API
  async function handleContainerDeleteSubmit(event) {
    setUploaded(false);
    event.preventDefault();
    const url = `${apiUrl}/deleteContainer`;
    const body = { containerName: containerDeleteName };
    axios.post(url, body)
      .then(response => {
        console.log(response);
        setContainerDeleteName('');
        setRefreshContainer(!refreshContainer);
        setUploaded(true);
      }).catch(err => {
        alert('Container Delete Error', err);
      });
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
          <button className="adminButton" onClick={createContainerToggle}>Create Container - Requires Owner Role
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
          <button className="adminButton" onClick={deleteContainerToggle}>Delete Container - Requires Owner Role
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
        </div>
        <DisplayFiles uploaded={uploaded} localAccountId={localAccountId} />
      </>
    );
  }

}
