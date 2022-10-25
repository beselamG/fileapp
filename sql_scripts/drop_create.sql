DROP TABLE IF EXISTS [dbo].[Files]
CREATE TABLE [dbo].[Files](
	[ContainerName] [nvarchar](256) NOT NULL,
	[FileName] [nvarchar](256) NOT NULL,
	[OwnerId] [nvarchar](128) NOT NULL,
	[BlobURL] [nvarchar](2048) NOT NULL,
	[UploadTime] [nvarchar](2048) NOT NULL,
	[UpdateTime] [nvarchar](2048) NOT NULL,
) ON [PRIMARY]