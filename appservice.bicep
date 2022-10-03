param location string = 'northeurope'

resource appServicePlan 'Microsoft.Web/serverfarms@2020-12-01' = {
  name: 'myappserviceplan'
  location: location
  sku: {
    name: 'F1'
    capacity: 1
  }
}

resource webApplication 'Microsoft.Web/sites@2021-01-15' = {
  name: 'beselamwebapp765'
  location: location
  properties: {
    serverFarmId: appServicePlan.id
  }
}

