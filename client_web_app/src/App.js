// client/src/App.js
import React from 'react';
import './App.css';
import { useState, useEffect } from 'react';
import Upload from './components/Upload';
import { PageLayout } from './components/PageLayout';
import {
  AuthenticatedTemplate,
  UnauthenticatedTemplate,
  useMsal,
} from '@azure/msal-react';
import { getMsalConfig, loginRequest } from './authConfig';
import { AppConfigContext } from './AppConfigContext';
import { AppConfigurationClient } from '@azure/app-configuration';
import { PublicClientApplication } from '@azure/msal-browser';
import { MsalProvider } from '@azure/msal-react';
import { BlobProvider } from './components/BlobContext.js';


//provide the app configuration client
const getAppConfigClient = () => {

  const connection_string = process.env.AZURE_APP_CONFIG_CONNECTION_STRING || 'Endpoint=https://fileuploaderproappconfig.azconfig.io;Id=IonS-l9-s0:xFGH/OY4WWfwvja+MgZ5;Secret=L5Yp46TMvmWql/zmCZzrAZ3Z/ZGf4KJ5x8T8n2z34jQ=';
  console.log(connection_string);
  const client = new AppConfigurationClient(
    connection_string
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
      {accessToken ? <p>Your roles are: {instance.getActiveAccount().idTokenClaims.roles}</p> : <p>No Access token</p>}
      <BlobProvider>
        <Upload localAccountId={localAccountId} />
      </BlobProvider>
    </>
  );
}

function App() {
  const [apiUrl, setApiUrl] = useState(null);
  const [redirectUrl, setRedirectApiUrl] = useState(null);
  const msalInstance = new PublicClientApplication(getMsalConfig(redirectUrl));




  useEffect(() => {
    getAppConfig();

  }, []);

  const getAppConfig = async () => {
    //If dev enviroment get localhost url
    if (process.env.REACT_APP_ENVIRONMENT == 'development') {
      try {
        const client = getAppConfigClient();
        const api_url = await client.getConfigurationSetting({
          key: 'REACT_APP_API_URL_DEV',
        });
        const redirect_url = await client.getConfigurationSetting({
          key: 'REACT_APP_REDERICT_URI_DEV',
        });
        if (api_url.value != undefined && redirect_url.value != undefined) {
          setApiUrl(api_url.value);
          setRedirectApiUrl(redirect_url.value);

          console.log('valuess', apiUrl, redirectUrl);
        }
      } catch (error) {
        console.log(error);
      }
    }
    else {
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

          console.log('valuess', apiUrl, redirectUrl);
        }
      } catch (error) {
        console.log(error);
      }
    }

  };

  if (apiUrl == null || redirectUrl == null) {
    return <p>Service not available</p>;
  }

  return (
    <AppConfigContext.Provider value={[apiUrl, redirectUrl]}>

      <MsalProvider instance={msalInstance}>
        <PageLayout>
          <AuthenticatedTemplate>
            <ProfileContent />
          </AuthenticatedTemplate>
          <UnauthenticatedTemplate>
            <p>You are not signed in! Please sign in.</p>
          </UnauthenticatedTemplate>
        </PageLayout>
      </MsalProvider>

    </AppConfigContext.Provider>
  );
}
export default App;
