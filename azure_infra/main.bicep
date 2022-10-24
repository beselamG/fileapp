param location string = resourceGroup().location


param planName string

resource appServicePlan 'Microsoft.Web/serverfarms@2020-12-01' = {
  name: planName
  location: location
  sku: {
    name: 'F1'
    capacity: 1
  }
}

resource webApplication 'Microsoft.Web/sites@2021-01-15' = {
  name: 'nameA232dsdsds'
  location: location
  properties: {
    serverFarmId: appServicePlan.id
  }
}

