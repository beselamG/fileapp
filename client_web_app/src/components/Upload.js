import React, { useContext } from 'react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import DisplayFiles from './DisplayFiles';
import blobs from './blobs';
import { useMsal } from '@azure/msal-react';
import { hasBlobWrite, hasBlobRead } from './rbac';
import { AppConfigContext } from '../AppConfigContext';


export default function Upload({ localAccountId }) {
  const [file, setFile] = useState();
  const [uploaded, setUploaded] = useState(false);
  const [containers, setContainer] = useState([]);
  const [selectedContainer, setSelectedContainer] = useState();
  const [apiUrl] = useContext(AppConfigContext);
  const [containerName, setContainerName] = useState('');
  const [refreshContainer, setRefreshContainer] = useState(true);

  // retrieve account roles
  const { instance } = useMsal();

  //Handle file selection
  function handleFileChange(event) {
    setFile(event.target.files[0]);
  }
  function handleContainerChange(event) {
    setContainerName(event.target.value);
  }
  //handle container dropdow select
  const handleSelect = (event) => {
    console.log('Handle select');
    setSelectedContainer(event.target.value);

  };


  //Get all containers here when signed in and when new container is created
  useEffect(() => {
    // if has write permission
    if (hasBlobWrite(instance)) {
      blobs.getContainer(apiUrl).then(conts => {
        setContainer(conts);
        setSelectedContainer(conts[0].contName);

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

  async function handleContainerSubmit(event) {
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


  // if has write permission
  if (hasBlobWrite(instance)) {
    return (
      <>
        <div className='uploadMain'>
          {/* ADD CONTAINERS should add Admin permission for this*/}
          <div>
            <form className="containerForm" onSubmit={handleContainerSubmit}>
              <h2>Create Container</h2>
              <label style={{ paddingBottom: 10 }}>Type Container Name</label>
              <input type="text"
                value={containerName}
                onChange={handleContainerChange}
                style={{ marginBottom: 10 }} />
              <button type="submit">Create</button>
            </form>
          </div>

          {/* ADD CONTAINERS should add Admin permission for this*/}
          <div>
            <form className="containerForm" onSubmit={handleContainerSubmit}>
              <h2>Create Container</h2>
              <label style={{ paddingBottom: 10 }}>Type Container Name</label>
              <input type="text"
                value={containerName}
                onChange={handleContainerChange}
                style={{ marginBottom: 10 }} />
              <button type="submit">Create</button>
            </form>
          </div>


          {/* UPLOAD FORM */}
          <div>
            <form className="uploadForm" onSubmit={handleFileSubmit} >
              <h2>File Upload</h2>
              <label style={{ paddingBottom: 10 }}>Choose a Conainer</label>
              <select
                style={{ marginBottom: 10 }}
                onChange={handleSelect}
                value={selectedContainer}>
                {containers.map((x, i) =>
                  <option key={i} value={x.contName}>{x.contName}</option>
                )}
              </select>
              <input encType="multipart/form-data" name="file" type="file"
                onChange={handleFileChange}
                style={{ marginBottom: 10 }} />
              <button type="submit">Upload</button>
            </form>
          </div>
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
