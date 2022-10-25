import React, { useContext } from 'react';
import { useState, useEffect } from 'react';
import { useMsal } from '@azure/msal-react';
import axios from 'axios';
import { hasBlobWrite, hasBlobRead } from './rbac';
import { AppConfigContext } from '../AppConfigContext';
import { saveAs } from 'file-saver';
import SearchIcon from '@mui/icons-material/Search';
import FileDownloadRoundedIcon from '@mui/icons-material/FileDownloadRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import { useBlobs, useBlobsUpdate, useBlobsDelete } from './BlobContext.js';


export default function DisplayFiles({ uploaded, localAccountId }) {
  // retrieve account roles
  const { instance } = useMsal();
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [displaySearch, setDisplaySearch] = useState(false);
  const [searchArrayLenght, setSearchArrayLenght] = useState(null);
  const blob = useBlobs();
  const blobDelete = useBlobsDelete();
  const blobUpdate = useBlobsUpdate();
  const [displayFiles, setDisplayFiles] = useState(blob);
  const [apiUrl] = useContext(AppConfigContext);




  //Search bar input change
  const searchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  //Post API request to /mockSearch with search term
  const postSearch = (event) => {
    console.log(searchTerm);
    event.preventDefault();
    const url = `${apiUrl}/mockSearch`;
    const body = { searchTerm: searchTerm };
    axios.post(url, body)
      .then(response => {
        const resultObjArra = response.data;
        console.log(resultObjArra);
        setDisplaySearch(true);
        setSearchArrayLenght(resultObjArra.length);
        setDisplayFiles(resultObjArra);
      });
  };

  const resetSearch = () => {
    //Show all files, hide search info 
    setDisplaySearch(false);
    setSearchTerm('');
    setDisplayFiles(blob);
  };

  /*   useEffect(() => {
      const results = blob.filter(b =>
        b.FileName.toLowerCase().includes(searchTerm)
      );
      setDisplayFiles(results);
    }, [searchTerm]);
   */

  //GET updated data from DB when upload successfull
  //Get after sign in trigger with localAccountId
  //get after new file upload
  useEffect(() => {
    blobUpdate(apiUrl);
    setDisplaySearch(false);
    setSearchTerm('');
  }, [uploaded, localAccountId]);
  useEffect(() => {
    setDisplayFiles(blob);
    setLoading(false);
  }, [blob]);

  //DELETE storage based on container and file name 
  const handleDelete = async (event, BlobURL, FileName, ContainerName) => {
    //Ask if sure
    if (window.confirm(`Are you sure you want to delete ${FileName}`)) {
      //setBlob(blob.filter(p => p.BlobURL !== BlobURL))
      await axios.post(`${apiUrl}/dbDelele`, {
        containerName: ContainerName,
        fileName: FileName
      })
        .then(function (response) {
          console.log('delete Response: ', response.status);
          //If succesfully deletes, delete item from UI
          if (response.status == 200) {
            console.log('Deleted');
            //IF succesfull delete blob from Context state
            const deleteObj = blob.filter(p => p.BlobURL !== BlobURL);
            blobDelete(deleteObj);
          }
        }).then(() => {
          /*           setSearchResults(blob.filter(p => p.BlobURL !== BlobURL));
                    setSearchTerm(''); */
        });
    } else {
      // Do nothing if alert window select close!
      console.log('Thing was not deleted');
    }
  };
  //Download file
  const handleDownload = async (event, containerName, fileName) => {
    axios({
      url: `${apiUrl}/download`,
      method: 'POST',
      data: {
        containerName: containerName,
        fileName: fileName
      },
      responseType: 'blob', // important
    }).then((response) => {
      saveAs(response.data, fileName);
    });
  };

  // if has read permission
  if (hasBlobRead(instance)) {
    return (
      <div className="allFiles" >
        {/* Display search result sum if true. Display search bart if false */}

        {displaySearch ? <div className='searchInfo'>
          {searchArrayLenght} Search results for &apos; {searchTerm} &apos; 
          <button onClick={resetSearch}>Reset search</button>
        </div> :
          <div>
            <span> <SearchIcon /> </span>
            <input value={searchTerm}
              onChange={searchChange}
              className="searchBar"
              placeholder='Search by file name ' />
            <button onClick={postSearch}>Search</button>
          </div>
        }

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
                  <th>Upload Time</th>
                  <th>Modified Time</th>
                  <th>Download File</th>
                  <th>Delete</th>
                </tr>
                {displayFiles.map((x,i)=>
                  <tr key={i}>
                    <td key={x.i}>
                      {x.ContainerName}
                    </td>
                    <td key={x.i}>
                      {x.FileName}
                    </td>
                    <td key={x.i}>
                      {x.OwnerId}
                    </td>
                    <td key={x.i}>
                      {x.UploadTime}
                    </td>
                    <td key={x.i}>
                      {x.UpdateTime}
                    </td>
                    <td key={x.i}>
                      <button className="downloadBtn" onClick={event => handleDownload(event, x.ContainerName, x.FileName)}>
                        <FileDownloadRoundedIcon />
                      </button>
                    </td>
                    <td key={x.i}>
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
