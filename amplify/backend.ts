import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { storage, secondaryStorage } from './storage/resource';

/**
 * @see https://docs.amplify.aws/react/build-a-backend/ to add storage, functions, and more
 */
const backend = defineBackend({
  auth,
  storage,
  secondaryStorage,
});

// Do not override cfnBucket.bucketName here. S3 bucket names are globally unique,
// and Amplify's generated physical names avoid collisions during deployments.

const { cfnUserPool } = backend.auth.resources.cfnResources;

cfnUserPool.adminCreateUserConfig = {
  ...cfnUserPool.adminCreateUserConfig,
  allowAdminCreateUserOnly: true,
};
