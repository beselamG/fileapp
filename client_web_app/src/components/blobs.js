
import axios from 'axios';


//const apiUrl = process.env.REACT_APP_API_URL;
//const baseUrl = '/api/blobs' 

const getSQL = async (apiUrl) => {
  const request = axios.get(`${apiUrl}/dbAll`);
  return request.then(response => {
    console.log(response.data);
    return response.data;
  });
};
const getContainer = (apiUrl) => {
  const request = axios.get(`${apiUrl}/getContainer`);
  return request.then(response => {
    console.log('constainers', response.data);
    return response.data;
  });
};
const uploadBlob = async (apiUrl, file, localAccountId, selectedContainer, exists) => {
  const url = `${apiUrl}/upload`;
  console.log(file);
  let formData = new FormData();
  formData.append('localAccountId', localAccountId);
  formData.append('exists', exists);
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
  }).then((response) => {
    alert(JSON.stringify(response.data));
  });

};


export default { getSQL, getContainer, uploadBlob };
