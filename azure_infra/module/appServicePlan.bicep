param  name string = 'file-loader-plan'
param location string = resourceGroup().location
param isReserved bool = false
param kind string = 'app'
param sku object = {
   name: 'P1v2'
    tier: 'PremiumV2'
    size: 'P1v2'
    family: 'Pv2'
    capacity: 1
}

resource appServicePlan 'Microsoft.Web/serverfarms@2020-12-01' = {
  name: name
  location: location
  sku: sku
  kind:kind
  properties:{
    reserved:isReserved
    
  }
}

output apsId string = appServicePlan.id
