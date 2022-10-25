param location string = resourceGroup().location

resource fileUploaderProAppConfiggd 'Microsoft.AppConfiguration/configurationStores@2022-05-01' = {
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
  name: 'fileUploaderProAppConfiggddd'
}
