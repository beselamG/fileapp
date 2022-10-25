param name string = 'fileLoaderAppBackupFunc'
param location string = resourceGroup().location
param appServicePlanId string 
@secure()
param storageAccountConnString string 
param appInsightKey string
@allowed([
  'node'
  'dotnet'
  'java'
])
param runtime string = 'node'
param extensionVersion string = '~4'
param nodeDefaultVersion string = '~16'



resource functionApp 'Microsoft.Web/sites@2021-03-01' = {
  name: name
  location: location
  kind: 'functionapp'
  identity: {
    type: 'SystemAssigned'
  }
  properties: {
    serverFarmId: appServicePlanId
    siteConfig: {
      appSettings: [
        {
          name: 'AzureWebJobsStorage'
          value: storageAccountConnString
        }
        {
          name: 'WEBSITE_CONTENTAZUREFILECONNECTIONSTRING'
          value: storageAccountConnString
        }
        {
          name: 'WEBSITE_CONTENTSHARE'
          value: toLower(name)
        }
        {
          name: 'FUNCTIONS_EXTENSION_VERSION'
          value: extensionVersion
        }
        {
          name: 'WEBSITE_NODE_DEFAULT_VERSION'
          value: nodeDefaultVersion
        }
        {
          name: 'APPINSIGHTS_INSTRUMENTATIONKEY'
          value: appInsightKey
        }
        {
          name: 'FUNCTIONS_WORKER_RUNTIME'
          value: runtime
        }
      ]
      ftpsState: 'FtpsOnly'
      minTlsVersion: '1.2'
    }
    httpsOnly: true
  }
}
