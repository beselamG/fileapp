
import axios from 'axios'
const baseUrl = process.env.REACT_APP_API_URL
//const baseUrl = '/api/blobs' 

const getSQL = async () => {
    const request = axios.get(`${baseUrl}/dbTest`)
    return request.then(response => {
      console.log(response.data);
      return response.data
    })
  }
const getContainer = () => {
    const request = axios.get(`${baseUrl}/getContainer`)
    return request.then(response => {
      console.log(response.data);
      return response.data
    })
  }
  
  
  export default {getSQL, getContainer}
