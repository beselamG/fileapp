import React, { useContext, useState } from 'react';
import blobs from './blobs';

const BlobContext = React.createContext();
const BlobUpdateContext = React.createContext();

export function useBlobs() {
  return useContext(BlobContext);
}
export function useBlobsUpdate() {
  return useContext(BlobUpdateContext);
}

export function BlobProvider({ children }) {
  const [blob, setBlob] = useState([]);

  const getBlob = async (apiUrl) => {
    await blobs.getSQL(apiUrl).then((initialBlobs) => {
      console.log('4 initiaal? ',initialBlobs);
      setBlob(initialBlobs);
      console.log('UPDATEted',  blob);
    });
  };

  return (
    <BlobContext.Provider value={blob}>
      <BlobUpdateContext.Provider value={getBlob}>
        {children}
      </BlobUpdateContext.Provider>
    </BlobContext.Provider>
  );
}
