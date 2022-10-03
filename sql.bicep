
@description('Location for all resources.')
param location string = resourceGroup().location

resource sqlServer 'Microsoft.Sql/servers@2014-04-01' ={
  name: 'beseserver'
  location: location
}

resource sqlServerDatabase 'Microsoft.Sql/servers/databases@2014-04-01' = {
  parent: sqlServer
  name: 'besesqldb'
  location: location
  properties: {
    collation: 'collation'
    edition: 'Basic'
    maxSizeBytes: 'maxSizeBytes'
    requestedServiceObjectiveName: 'Basic'
  }
}
