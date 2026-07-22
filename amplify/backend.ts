import { defineBackend } from '@aws-amplify/backend';
import { Aspects, IAspect } from 'aws-cdk-lib';
import { ArnPrincipal, Effect, PolicyStatement } from 'aws-cdk-lib/aws-iam';
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

const expedientesBucket = backend.secondaryStorage.resources.bucket;
const privateIdentityPrefix = 'privado/${cognito-identity.amazonaws.com:sub}';
const gexpedientesPrincipal = new ArnPrincipal(
  backend.auth.resources.groups.gexpedientes.role.roleArn
);
const authenticatedUsersPrincipal = new ArnPrincipal(
  backend.auth.resources.authenticatedUserIamRole.roleArn
);

// Storage group rules replace {entity_id} with a wildcard. Keep the owner-scoped
// storage output and enforce the gexpedientes gate from the bucket policy.
expedientesBucket.addToResourcePolicy(
  new PolicyStatement({
    effect: Effect.ALLOW,
    principals: [gexpedientesPrincipal],
    actions: ['s3:GetObject', 's3:PutObject'],
    resources: [`${expedientesBucket.bucketArn}/${privateIdentityPrefix}/*`],
  })
);

expedientesBucket.addToResourcePolicy(
  new PolicyStatement({
    effect: Effect.ALLOW,
    principals: [gexpedientesPrincipal],
    actions: ['s3:ListBucket'],
    resources: [expedientesBucket.bucketArn],
    conditions: {
      StringLike: {
        's3:prefix': [`${privateIdentityPrefix}/*`, `${privateIdentityPrefix}/`],
      },
    },
  })
);

expedientesBucket.addToResourcePolicy(
  new PolicyStatement({
    effect: Effect.DENY,
    principals: [authenticatedUsersPrincipal],
    actions: ['s3:GetObject', 's3:PutObject'],
    resources: [`${expedientesBucket.bucketArn}/privado/*`],
  })
);

expedientesBucket.addToResourcePolicy(
  new PolicyStatement({
    effect: Effect.DENY,
    principals: [authenticatedUsersPrincipal],
    actions: ['s3:ListBucket'],
    resources: [expedientesBucket.bucketArn],
    conditions: {
      StringLike: {
        's3:prefix': ['privado/*', 'privado/'],
      },
    },
  })
);

const { cfnUserPool } = backend.auth.resources.cfnResources;

cfnUserPool.adminCreateUserConfig = {
  ...cfnUserPool.adminCreateUserConfig,
  allowAdminCreateUserOnly: true,
};
