param location string = 'northeurope'
param storageAccountName string = 'storage${uniqueString(resourceGroup().id)}'

resource storageaccount 'Microsoft.Storage/storageAccounts@2021-02-01' = {
  name: storageAccountName
  location: location
  kind: 'StorageV2'
  sku: {
    name: 'Premium_LRS'
  }
  resource beseblob 'blobServices' = {
    name: 'default'

    resource container 'containers' = {
      name: 'besecontainer997'
      
    }

  }
}
