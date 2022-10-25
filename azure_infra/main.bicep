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
param serverName string = uniqueString('sql', resourceGroup().id)

@description('The name of the SQL Database.')
param sqlDBName string = 'fileMeta'

@description('keyvault name')
param kv string = 'teamaz-key-vaultx'

@description('sql server endpoint')
var sqlSrvName = environment().suffixes.sqlServerHostname

@description('sql server full url')
var sqlServerUrl = '${serverName}${sqlSrvName}'

@description('The type of environment. This must be nonprod or prod.')
@allowed([
  'dev'
  'prod'
])
param environmentType string

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

@description('Define the SKUs for each component based on the environment type.')
var environmentConfigurationMap = {
  dev: {
    appServicePlan: {
      sku: {
        name: 'F1'
        capacity: 1
      }
    }
     storageAccount: {
      sku: {
        name: 'Standard_LRS'
        tier: 'Standard'
      }
    }
  }
  prod: {
    appServicePlan: {
      sku: {
        name: 'P1v2'
        tier: 'PremiumV2'
        size: 'P1v2'
        family: 'Pv2'
        capacity: 1
      }
    }
    storageAccount: {
      sku: {
        name: 'Standard_ZRS'
        tier: 'Standard'
      }
    }
  }
}

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
  name: 'fileUploaderProAppConfigxcvcv'
}

module storageAccount 'module/storage_standard.bicep' = {
  name: 'fileUploaderstorage'
  params: {
    location: location
    sku:environmentConfigurationMap[environmentType].storageAccount.sku
    
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

module function 'module/function.bicep' = {
  dependsOn:[appServicePlanFunc]
  name: 'fileloaderfun34455'
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
    sku:environmentConfigurationMap[environmentType].appServicePlan.sku

  }
}

module webAppFront 'module/webAppService.bicep' = {
  name: 'webappserviceFrontEnd'
  params: {
    appServicePlanId: webAppServicePlan.outputs.apsId
    location: location
    name: frontWebApp
  }
}

module webAppBack 'module/webAppService.bicep' = {
  name: 'webappServiceBackend'
  params: {
    appServicePlanId: webAppServicePlan.outputs.apsId
    location: location
    name: backendWebApp
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
