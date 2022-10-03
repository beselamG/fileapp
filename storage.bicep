@allowed([
  'dev'
  'prod'
])
param enviroment string

@description('Specifies the location for resources.')
param location string = resourceGroup().location


resource storageaccount 'Microsoft.Storage/storageAccounts@2021-02-01' = {
  name: 'besestorage'
  location: location
  kind: 'StorageV2'
  sku: {
    name:  (enviroment == 'dev') ? 'Standard_LRS' : 'Standard_GRS'
  }
  properties:{
    supportsHttpsTrafficOnly:true
  }
}
