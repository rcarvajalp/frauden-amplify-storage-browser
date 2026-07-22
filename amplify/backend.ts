import { defineBackend } from '@aws-amplify/backend';
import { Aspects, IAspect } from 'aws-cdk-lib';
import { CfnFunction } from 'aws-cdk-lib/aws-lambda';
import { IConstruct } from 'constructs';
import { auth } from './auth/resource';
import { secondaryStorage, storage } from './storage/resource';

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

class AmplifyBranchLinkerNodeRuntime implements IAspect {
  visit(node: IConstruct) {
    if (node instanceof CfnFunction && node.node.path.includes('AmplifyBranchLinker')) {
      node.runtime = 'nodejs24.x';
    }
  }
}

Aspects.of(backend.stack).add(new AmplifyBranchLinkerNodeRuntime());

const { cfnUserPool } = backend.auth.resources.cfnResources;

cfnUserPool.adminCreateUserConfig = {
  ...cfnUserPool.adminCreateUserConfig,
  allowAdminCreateUserOnly: true,
};
