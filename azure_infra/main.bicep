param location string = resourceGroup().location
param frontWebApp string = 'fileloaderappFrontEnd'
param backendWebApp string = 'fileloaderappBackEnd'

@description('The administrator username of the SQL logical server.')
@secure()
param adminUserName string

@description('The administrator password of the SQL logical server.')
@secure()
param adminPassword string

@description('The name of the SQL logical server.')
param serverName string = 'fileloaderapppro'

@description('The name of the SQL Database.')
param sqlDBName string = 'fileMeta'

@description('keyvault name')
param kv string = 'teamaz-key-vaultx'

@description('front end web app name  name')
param frontEndAppName string = 'fileloaderappPro'

@description('back end web app name  name')
param backEndAppName string = 'file-loader-back'

@description('function app name')
param functionAppName string = 'blobdownloaderPro'

@description('app config name')
param appConfigName string = 'fileUploaderProAppConfigPro'

@description('sql server endpoint')
var sqlSrvName = environment().suffixes.sqlServerHostname

@description('sql server full url')
var sqlServerUrl = '${serverName}${sqlSrvName}'


@description('list of keys value pairs to be stored in the app config')
param appConfigKeyValue array = [
  { key: 'REACT_APP_API_URL'
    value: 'https://file-loader-back.azurewebsites.net' }
  { key: 'REACT_APP_API_URL_DEV'
    value: 'http://localhost:3001' }
  { key: 'REACT_APP_REDERICT_URI'
    value: 'https://fileloaderapp.azurewebsites.net' }
  { key: 'REACT_APP_REDERICT_URI_DEV'
    value: 'http://localhost:3000' }
]

resource appConfigStore 'Microsoft.AppConfiguration/configurationStores@2022-05-01' = {
  location: location
  properties: {
    encryption: {
    }
    disableLocalAuth: false

    softDeleteRetentionInDays: 7
    enablePurgeProtection: false
  }
  sku: {
    name: 'standard'
  }
  name: appConfigName
}

module storageAccount 'module/storage_standard.bicep' = {
  name: 'fileUploaderstorage'
  params: {
    location: location
    sku: {
      name: 'Standard_LRS'
      tier: 'Standard'
    }

  }
}

resource srorageAccountNameSecret 'Microsoft.KeyVault/vaults/secrets@2022-07-01' = {

  name: '${kv}/STOR-ACCOUNT'
  properties: {
    value: storageAccount.outputs.storageAccountName
  }
}

resource storageAccountConnStringSecrete 'Microsoft.KeyVault/vaults/secrets@2022-07-01' = {

  name: '${kv}/STO-CONN-STRING'
  properties: {
    value: storageAccount.outputs.storageAccountConnString
  }
}

resource storageAccountIdSecrete 'Microsoft.KeyVault/vaults/secrets@2022-07-01' = {

  name: '${kv}/STO-ID'
  properties: {
    value: storageAccount.outputs.storageAcoountId
  }
}

module appServicePlanFunc 'module/appServicePlan.bicep' = {
  name: 'appServicePlanFunc'
  params: {
    name: 'backupFunAppPlan'
    location: location
    kind: 'functionapp'
    sku: {
      name: 'Y1'
      tier: 'Dynamic'
    }

  }

}

module appInsight 'module/appInsight.bicep' = {
  name: 'appInsight'
  params: {
    location: location
  }
}
module appInsightFrontend 'module/appInsight.bicep' = {
  name: 'appInsightFron'
  params: {
    location: location
  }
}
module appInsightBack 'module/appInsight.bicep' = {
  name: 'appInsightBack'
  params: {
    location: location
  }
}

module function 'module/function.bicep' = {
  dependsOn: [ appServicePlanFunc ]
  name: functionAppName
  params: {
    location: location
    appInsightKey: appInsight.outputs.instrumentationKey
    appServicePlanId: appServicePlanFunc.outputs.apsId
    storageAccountConnString: storageAccount.outputs.storageAccountConnString
  }
}

module webAppServicePlan 'module/appServicePlan.bicep' = {
  name: 'appServicePlan'
  params: {
    location: location
    sku: {
      name: 'P1v2'
      tier: 'PremiumV2'
      size: 'P1v2'
      family: 'Pv2'
      capacity: 1
    }

  }
}

module webAppFront 'module/webAppService.bicep' = {
  name: frontEndAppName
  params: {
    appServicePlanId: webAppServicePlan.outputs.apsId
    location: location
    name: frontWebApp
    appSiteConfig: [
      {
        name: 'APPINSIGHTS_INSTRUMENTATIONKEY'
        value: appInsightFrontend.outputs.instrumentationKey
      }
      {
        name: 'WEBSITE_NODE_DEFAULT_VERSION'
        value: '~16'
      }
    ]
  }
}

module webAppBack 'module/webAppService.bicep' = {
  name: backEndAppName
  params: {
    appServicePlanId: webAppServicePlan.outputs.apsId
    location: location
    name: backendWebApp
    appSiteConfig: [
      {
        name: 'APPINSIGHTS_INSTRUMENTATIONKEY'
        value: appInsightBack.outputs.instrumentationKey
      }
      {
        name: 'WEBSITE_NODE_DEFAULT_VERSION'
        value: '~16'
      }
    ]
  }
}

module sqlModule 'module/sqlDb.bicep' = {
  name: 'sqlDeploy'
  params: {
    serverName: serverName
    sqlDBName: sqlDBName
    location: location
    administratorLogin: adminUserName
    administratorLoginPassword: adminPassword
  }
}

resource sqlServerSecrete 'Microsoft.KeyVault/vaults/secrets@2022-07-01' = {
  dependsOn: [ sqlModule ]
  name: '${kv}/SQL-SERVER'
  properties: {
    value: sqlServerUrl
  }
}

resource configurationStoreValue 'Microsoft.AppConfiguration/configurationStores/keyValues@2021-10-01-preview' = [for keyValue in appConfigKeyValue: {
  name: keyValue.key
  parent: appConfigStore
  properties: {
    contentType: 'string'
    value: keyValue.value
  }
}]
