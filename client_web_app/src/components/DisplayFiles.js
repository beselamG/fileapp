import React, { useContext } from 'react';
import { useState, useEffect } from 'react';
import { useMsal } from '@azure/msal-react';
import axios from 'axios';
import blobs from './blobs';
import { hasBlobWrite, hasBlobRead } from './rbac';
import { AppConfigContext } from '../AppConfigContext';
import { saveAs } from 'file-saver';
import SearchIcon from '@mui/icons-material/Search';
import FileDownloadRoundedIcon from '@mui/icons-material/FileDownloadRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import { useBlobs, useBlobsUpdate } from './BlobContext.js';


export default function DisplayFiles({ uploaded, localAccountId }) {
  const [container, setContainers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const blob = useBlobs();
  const blobUpdate = useBlobsUpdate();
  const [searchResults, setSearchResults] = useState(blob);
  const [apiUrl] = useContext(AppConfigContext);




  //Search bar input change
  const searchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  useEffect(() => {
    const results = blob.filter(b =>
      b.FileName.toLowerCase().includes(searchTerm)
    );
    setSearchResults(results);
  }, [searchTerm]);


  //GET updated data from DB when upload successfull
  //Get after sign in trigger with localAccountId
  //get after page reload
  useEffect(() => {
    console.log('effect');
    blobUpdate(apiUrl);
   
    console.log(localAccountId);
  }, []);
  //get after new file upload
  useEffect(() => {
    blobUpdate(apiUrl);
  }, [uploaded, localAccountId]);
  useEffect(() => {
    setSearchResults(blob);
  }, [blob]);

  // retrieve account roles
  const { instance } = useMsal();





  //DELETE storage based on container and file name 
  const handleDelete = (event, BlobURL, FileName, ContainerName) => {
    //Ask if sure
    if (window.confirm(`Are you sure you want to delete ${FileName}`)) {
      //setBlob(blob.filter(p => p.BlobURL !== BlobURL))
      axios.post(`${apiUrl}/dbDelele`, {
        containerName: ContainerName,
        fileName: FileName
      })
        .then(function (response) {
          console.log('delete Response: ', response.status);
          //If succesfully deletes, delete item from UI
          if (response.status == 200) {
            console.log('Deleted');
            setSearchResults(blob.filter(p => p.BlobURL !== BlobURL));
            setSearchTerm('');
            blobUpdate(apiUrl);
            
          }
        });
    } else {
      // Do nothing if alert window select close!
      console.log('Thing was not deleted');
    }
  };
  //Download file
  const handleDownload = (event, BlobURL, FileName) => {
    saveAs(
      BlobURL,
      FileName
    );
  };

  // if has read permission
  if (hasBlobRead(instance)) {
    return (
      <div className="allFiles" >
        <span> <SearchIcon /> </span>
        <input value={searchTerm}
          onChange={searchChange}
          className="searchBar"
          placeholder='Search by file name ' />
        <div className="tableContainer">
          {/* If fetching DB data  */}
          {loading ? (
            <div>...Data Loading.....</div>
          ) : (
            <table className="fileTable">
              <tbody>
                <tr>
                  <th>Container</th>
                  <th>File name</th>
                  <th>Uploaded by Id</th>
                  <th>Download File</th>
                  <th>Delete</th>
                </tr>
                {searchResults.map(x =>
                  <tr key={Math.random() * 9999}>
                    <td key={Math.random() * 9999}>
                      {x.ContainerName}
                    </td>
                    <td key={Math.random() * 9999}>
                      {x.FileName}
                    </td>
                    <td key={Math.random() * 9999}>
                      {x.OwnerId}
                    </td>
                    <td key={Math.random() * 9999}>
                      <button className="downloadBtn" onClick={event => handleDownload(event, x.BlobURL, x.FileName)}>
                        <FileDownloadRoundedIcon />
                      </button>
                    </td>
                    <td key={Math.random() * 9999}>
                      <button className="deleteBtn" onClick={event => handleDelete(event, x.BlobURL, x.FileName, x.ContainerName)}>
                        <DeleteRoundedIcon />
                      </button>
                    </td>
                  </tr>
                )
                }
              </tbody>
            </table>
          )}
        </div>
        <hr />
      </div>
    );
    //otherwise no read permission
  } else {
    return (
      <div className="App" >
        <h1>You have no permission to read files!</h1>
      </div>
    );
  }
}
