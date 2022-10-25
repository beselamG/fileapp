@description('location for the resource')
param location string = resourceGroup().location

@description('name of the resource')
param name string 

@description('tenant id ')
param tenantId string 

@description('object id for user name B')
param objectIdB string 

@description('object id for user name T')
param objectIdT string 

@description('object id for user name X')
param objectIdX string 

@secure()
param serverUserName string

@secure()
param serverPassword string

resource keyVault 'Microsoft.KeyVault/vaults@2022-07-01' = {
  name: name
  location: location
  properties: {
    enabledForDeployment: true
    enabledForTemplateDeployment: true
    enabledForDiskEncryption: true
    enableSoftDelete: false
    enablePurgeProtection: true
    tenantId: tenantId
    accessPolicies: [
      {
        tenantId: tenantId
        objectId: objectIdB
        permissions: {
          keys: [
            'all'
          ]
          secrets: [
            'all'
          ]
          certificates: [
            'all'
          ]
        }
      }
      {
        tenantId: tenantId
        objectId: objectIdT
        permissions: {
          keys: [
            'get'
            'List'
            'Update'
            'Create'
            'Import'
            'Delete'
            'Recover'
            'Backup'
          ]
          secrets: [
            'list'
            'get'
            'Delete'
            'Set'
            'Recover'
          ]
          certificates: [
            'Get'
            'List'
            'Update'
            'Create'
            'Import'
            'Delete'
            'Recover'
            'Backup'
            'Restore'
            'ManageContacts'
            'ManageIssuers'
            'GetIssuers'
            'ListIssuers'
            'SetIssuers'
            'DeleteIssuers'

          ]
        }
      }
      {
        tenantId: tenantId
        objectId: objectIdX
        permissions: {
          keys: [
            'get'
            'List'
            'Update'
            'Create'
            'Import'
            'Delete'
            'Recover'
            'Backup'
          ]
          secrets: [
            'list'
            'get'
            'Delete'
            'Set'
            'Recover'
          ]
          certificates: [
            'Get'
            'List'
            'Update'
            'Create'
            'Import'
            'Delete'
            'Recover'
            'Backup'
            'Restore'
            'ManageContacts'
            'ManageIssuers'
            'GetIssuers'
            'ListIssuers'
            'SetIssuers'
            'DeleteIssuers'

          ]
        }
      }
    ]
    sku: {
      name: 'standard'
      family: 'A'
    }
  }
  resource sqlUser 'secrets' = {
    name: 'SQL-USERNAME'
    properties: {
      value: serverUserName
    }
  }
  resource sqlUserPass 'secrets' = {
    name: 'SQL-PASSWORD'
    properties: {
      value: serverPassword
    }
  }
}

output name string = keyVault.name
