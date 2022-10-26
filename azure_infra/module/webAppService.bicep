param name  string  = 'fileloaderapp' 
param location string = resourceGroup().location
param appServicePlanId string
param appSiteConfig array = []

resource webApplication 'Microsoft.Web/sites@2021-01-15' = {
  name: name 
  location: location
  properties: {
    serverFarmId: appServicePlanId
    siteConfig:{
      appSettings:appSiteConfig
    }
  }
}
