param name  string  = 'fileloaderapp' 
param location string = resourceGroup().location
param appServicePlanId string


resource webApplication 'Microsoft.Web/sites@2021-01-15' = {
  name: name 
  location: location
  tags: {
    'hidden-related:${resourceGroup().id}/providers/Microsoft.Web/serverfarms/appServicePlan': 'Resource'
  }
  properties: {
    serverFarmId: appServicePlanId
  }
}
