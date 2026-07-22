import { defineBackend } from '@aws-amplify/backend';
import { Aspects, IAspect } from 'aws-cdk-lib';
import { Effect, Policy, PolicyStatement } from 'aws-cdk-lib/aws-iam';
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
const expedientesAccessStack = backend.createStack('expedientesAccess');
const privateIdentityPrefix = 'privado/${cognito-identity.amazonaws.com:sub}';

// Storage group rules replace {entity_id} with a wildcard. Keep the owner-scoped
// storage output and enforce the gexpedientes gate from a separate stack to
// avoid a direct Auth <-> Storage dependency cycle.
new Policy(expedientesAccessStack, 'GExpedientesPrivateFolderAccess', {
  roles: [backend.auth.resources.groups.gexpedientes.role],
  statements: [
    new PolicyStatement({
      effect: Effect.ALLOW,
      actions: ['s3:GetObject', 's3:PutObject'],
      resources: [`${expedientesBucket.bucketArn}/${privateIdentityPrefix}/*`],
    }),
    new PolicyStatement({
      effect: Effect.ALLOW,
      actions: ['s3:ListBucket'],
      resources: [expedientesBucket.bucketArn],
      conditions: {
        StringLike: {
          's3:prefix': [`${privateIdentityPrefix}/*`, `${privateIdentityPrefix}/`],
        },
      },
    }),
  ],
});

new Policy(expedientesAccessStack, 'AuthenticatedPrivateFolderDeny', {
  roles: [backend.auth.resources.authenticatedUserIamRole],
  statements: [
    new PolicyStatement({
      effect: Effect.DENY,
      actions: ['s3:GetObject', 's3:PutObject'],
      resources: [`${expedientesBucket.bucketArn}/privado/*`],
    }),
    new PolicyStatement({
      effect: Effect.DENY,
      actions: ['s3:ListBucket'],
      resources: [expedientesBucket.bucketArn],
      conditions: {
        StringLike: {
          's3:prefix': ['privado/*', 'privado/'],
        },
      },
    }),
  ],
});

const { cfnUserPool } = backend.auth.resources.cfnResources;

cfnUserPool.adminCreateUserConfig = {
  ...cfnUserPool.adminCreateUserConfig,
  allowAdminCreateUserOnly: true,
};
