param  storageName string = 'storcafla426wsqmw11'
param location string = resourceGroup().location

@allowed([
  'Standard_LRS'
  'Standard_GRS'
  'Standard_RAGRS'
])
param storageAccountType string = 'Standard_LRS'

@allowed([
  'Hot'
  'Cool'
])
param accessTier string = 'Hot'


resource storageAccount 'Microsoft.Storage/storageAccounts@2021-02-01' = {
  name: storageName
  location: location
  kind: 'StorageV2'
  sku: {
    name: storageAccountType
  }
 properties:{
  accessTier:accessTier
 }

}
var storageAccountConnectionStr = 'DefaultEndpointsProtocol=https;AccountName=${storageAccount.name};EndpointSuffix=${environment().suffixes.storage};AccountKey=${storageAccount.listKeys().keys[0].value}'
output storageAccountName string = storageAccount.name
output storageAcoountId string = storageAccount.id
output storageAcoountApiVersion  string = storageAccount.apiVersion
output storageAccountConnString string = storageAccountConnectionStr




