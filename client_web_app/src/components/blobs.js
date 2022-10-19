
import axios from 'axios';


//const apiUrl = process.env.REACT_APP_API_URL;
//const baseUrl = '/api/blobs' 

const getSQL = async (apiUrl) => {
  const request = axios.get(`${apiUrl}/dbTest`);
  return request.then(response => {
    console.log(response.data);
    return response.data;
  });
};
const getContainer = (apiUrl) => {
  const request = axios.get(`${apiUrl}/getContainer`);
  return request.then(response => {
    console.log(response.data);
    return response.data;
  });
};
  
  
export default {getSQL, getContainer};
