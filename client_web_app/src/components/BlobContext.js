import React, { useContext, useState } from 'react';
import blobs from './blobs';

const BlobContext = React.createContext();
const BlobUpdateContext = React.createContext();
const BlobDeleteContext = React.createContext();

export function useBlobs() {
  return useContext(BlobContext);
}
export function useBlobsUpdate() {
  return useContext(BlobUpdateContext);
}
export function useBlobsDelete() {
  return useContext(BlobDeleteContext);
}

export function BlobProvider({ children }) {
  const [blob, setBlob] = useState([]);

  const getBlob = async (apiUrl) => {
    await blobs.getSQL(apiUrl).then((initialBlobs) => {
      console.log('Context get blobs ', initialBlobs);
      setBlob(initialBlobs);
      console.log('UPDATEted', blob);
    });
  };
  const deleteBlob = (newObj) => {
    setBlob(newObj);
    console.log('Deleted', newObj);

  };


  return (
    <BlobContext.Provider value={blob}>
      <BlobUpdateContext.Provider value={getBlob}>
        <BlobDeleteContext.Provider value={deleteBlob}>


          {children}

        </BlobDeleteContext.Provider>
      </BlobUpdateContext.Provider>
    </BlobContext.Provider>
  );
}