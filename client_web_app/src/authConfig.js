//const adTenantId = "031e4f4a-6a35-45e0-a98e-107900032d62"

export const msalConfig = {
    auth: {
      clientId: "8d13d7e2-9573-4cce-988e-c8cdd7e351a8",
      authority: "https://login.microsoftonline.com/031e4f4a-6a35-45e0-a98e-107900032d62", // This is a URL (e.g. https://login.microsoftonline.com/{your tenant ID})
      redirectUri: process.env.REACT_APP_REDERICT_URI,
    },
    cache: {
      cacheLocation: "sessionStorage", // This configures where your cache will be stored
      storeAuthStateInCookie: false, // Set this to "true" if you are having issues on IE11 or Edge
    }
  };
  
  // Add scopes here for ID token to be used at Microsoft identity platform endpoints.
  export const loginRequest = {
   scopes: ["User.Read"]
  };
  
  // Add the endpoints here for Microsoft Graph API services you'd like to use.
  export const graphConfig = {
      graphMeEndpoint: "https://graph.microsoft.com"
  };