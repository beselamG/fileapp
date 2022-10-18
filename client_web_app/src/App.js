// client/src/App.js
import React from 'react';
import './App.css';
import { useState, useEffect } from 'react';
import axios from 'axios';
import Upload from './components/Upload';
import blobs from './components/blobs';
import { PageLayout } from './components/PageLayout';
import {
  AuthenticatedTemplate,
  UnauthenticatedTemplate,
  useMsal,
} from '@azure/msal-react';
import { loginRequest } from './authConfig';
import Button from 'react-bootstrap/Button';
import { AppConfigContext } from './AppConfigContext';
import { AppConfigurationClient } from '@azure/app-configuration';
import { DefaultAzureCredential } from '@azure/identity';

//provide the app configuration client
const getAppConfigClient = () => {
  const connection_string = process.env.WAR;
  const client = new AppConfigurationClient(
    'Endpoint=https://fileuploaderproappconfig.azconfig.io;Id=IonS-l9-s0:xFGH/OY4WWfwvja+MgZ5;Secret=L5Yp46TMvmWql/zmCZzrAZ3Z/ZGf4KJ5x8T8n2z34jQ='
  );
  return client;
};

//import DisplayFiles from "./components/DisplayFiles";

//Profile content component only accessable after Auth
function ProfileContent() {
  const { instance, accounts, inProgress } = useMsal();
  const [accessToken, setAccessToken] = useState(null);
  const [localAccountId, setLocalAccountId] = useState(null);

  const name = accounts[0] && accounts[0].name;

  useEffect(() => {
    RequestAccessToken();
  }, []);



  function RequestAccessToken() {
    const request = {
      ...loginRequest,
      account: accounts[0],
    };

    instance.setActiveAccount(accounts[0]);

    // silently acquires an access token
    instance
      .acquireTokenSilent(request)
      .then((response) => {
        setAccessToken(response.accessToken);
        setLocalAccountId(accounts[0].localAccountId);
      })
      .catch((e) => {
        instance.acquireTokenPopup(request).then((response) => {
          setAccessToken(response.accessToken);
          setLocalAccountId(accounts[0].localAccountId);
        });
      });
  }

  return (
    <>
      <h5 className="card-title">Welcome {name}</h5>
      {accessToken ? <p>Access Token Acquired!</p> : <p>No Access token</p>}
      <Upload localAccountId={localAccountId} />
    </>
  );
}

function App() {
  const [apiUrl, setApiUrl] = useState(null);
  const [redirectUrl, setRedirectApiUrl] = useState(null);

  useEffect(() => {
    getAppConfig();
  }, []);

  const getAppConfig = async () => {
    try {
      const client = getAppConfigClient();
      const api_url = await client.getConfigurationSetting({
        key: 'REACT_APP_API_URL',
      });
      const redirect_url = await client.getConfigurationSetting({
        key: 'REACT_APP_REDERICT_URI',
      });
      if (api_url.value != undefined && redirect_url.value != undefined) {
        setApiUrl(api_url.value);
        setRedirectApiUrl(redirect_url.value);

        console.log('valuess',apiUrl, redirectUrl);
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <PageLayout>
     
      {apiUrl != null && redirectUrl != null ? 
     
        <AppConfigContext.Provider value={[apiUrl,redirectUrl]}>
          <AuthenticatedTemplate>
            <ProfileContent />
          </AuthenticatedTemplate>
          <UnauthenticatedTemplate>
            <p>You are not signed in! Please sign in.</p>
          </UnauthenticatedTemplate>
        </AppConfigContext.Provider> 
        
        : <p>Service  not  available</p>}
    
    </PageLayout>
  );
}
export default App;
