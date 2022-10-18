const blobWrite = 'Blob.Write';
const blobRead = 'Blob.Read';

function hasBlobWrite(instance) {
  return hasPermission(instance, blobWrite);
}

function hasBlobRead(instance) {
  return hasPermission(instance, blobRead);
}

function hasPermission(instance, permission) {
  try {
   
    const roles = instance.getActiveAccount().idTokenClaims.roles;
   
    return roles.includes(permission);
  } catch {
    console.log('Checking permission fails!');
    return false;
  }
}

export { hasBlobWrite, hasBlobRead };
