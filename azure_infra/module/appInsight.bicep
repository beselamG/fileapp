param kind string = 'web'
param location string = resourceGroup().location
param name string = 'fileLoaderAppInsight'
param publicNetworkAccessForIngestion string = 'Enabled'
param publicNetworkAccessForQuery string = 'Enabled'

resource appInsightsComponent 'Microsoft.Insights/components@2020-02-02' = {
  name: name
  location: location
  kind: kind
  properties: {
    Application_Type: kind
    publicNetworkAccessForIngestion: publicNetworkAccessForIngestion
    publicNetworkAccessForQuery: publicNetworkAccessForQuery
  }
}

output instrumentationKey string = appInsightsComponent.properties.InstrumentationKey
