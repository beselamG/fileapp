# azure infra
## deploy
### main

#### create rg var
```bash
rg_name=rg-team-1-aug-dev-we
```

#### deploy complete
```bash
az deployment group create --template-file main.bicep --resource-group $rg_name --parameters main.parameters.json --mode Complete
```

# server web app
## deploy
Azure Web Apps is deployed with bicep IaC.

## apis
### /dbAll
query all files in database

### /dbQueryFileName
query files that matching the pattern

### /dbUpload
upload file in blob storage and metadata in database

### /createContainer
create a container

### /deleteContainer
delete a container

### /dbDelele
delete file in blob storage and metadata in database

### /getContainer
get all containers

### /download
download files from Blob storage


# database
## deploy
Azure SQL Database is deployed with bicep IaC.

## database scheme
```SQL
DROP TABLE IF EXISTS [dbo].[Files]
CREATE TABLE [dbo].[Files](
	[ContainerName] [nvarchar](256) NOT NULL,
	[FileName] [nvarchar](256) NOT NULL,
	[OwnerId] [nvarchar](128) NOT NULL,
	[BlobURL] [nvarchar](2048) NOT NULL,
	[UploadTime] [nvarchar](2048) NOT NULL,
	[UpdateTime] [nvarchar](2048) NOT NULL,
) ON [PRIMARY]
```

# client web app
## .env
```
REACT_APP_API_URL="CHANGEME"
```

# branches
## master
working branch for dev environment
## production
production branch for prod environment