import axios from "axios";
const baseUrl = process.env.REACT_APP_API_URL;
//const baseUrl = '/api/blobs'

const getSQL = async () => {
  const request = axios.get(`${baseUrl}/dbTest`);
  return request.then((response) => {
    console.log(response.data);
    return response.data;
  });
};
const getContainer = () => {
  const request = axios.get(`${baseUrl}/getContainer`);
  return request.then((response) => {
    console.log(response.data);
    return response.data;
  });
};

const create = (newObject) => {
  const request = axios.post(baseUrl, newObject);
  return request.then((response) => response.data);
};

const update = (id, newObject) => {
  const request = axios.put(`${baseUrl}/${id}`, newObject);
  return request.then((response) => response.data);
};

const remove = (id) => {
  const request = axios.delete(`${baseUrl}/${id}`);
  return request.then((response) => response.data);
};

export default { getSQL, create, update, remove, getContainer };
