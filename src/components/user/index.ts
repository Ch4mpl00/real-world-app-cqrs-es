import { createDynamodbUserRepository } from 'src/components/user/repository';
import { createOpenSearchReadRepository } from 'src/components/user/readRepository';
import { createCommandHandlers } from 'src/components/user/commands';
import { createDynamodbClient } from 'src/lib/dynamodb';
import { ensure } from 'src/lib/common';
import { createOpenSearchClient } from 'src/lib/opensearch';
import process from 'process';

const DYNAMODB_REGION = ensure(
  process.env.DYNAMODB_REGION,
  'process.env.DYNAMODB_REGION is not defined'
);

const DYNAMODB_TABLE_EVENT_LOG = ensure(
  process.env.DYNAMODB_TABLE_EVENT_LOG,
  'process.env.DYNAMODB_TABLE_EVENT_LOG is not defined'
);

const OPENSEARCH_USERS_PROJECTION_INDEX = ensure(
  process.env.OPENSEARCH_USERS_PROJECTION_INDEX,
  'process.env.OPENSEARCH_USERS_PROJECTION_INDEX is not defined'
);

const OPENSEARCH_DOMAIN_ENDPOINT = ensure(
  process.env.OPENSEARCH_DOMAIN_ENDPOINT,
  'process.env.OPENSEARCH_DOMAIN_ENDPOINT required'
);

const dynamodbEventLogClient = createDynamodbClient(DYNAMODB_REGION, process.env.DYNAMODB_ENDPOINT);
export const userRepository = createDynamodbUserRepository(
  dynamodbEventLogClient,
  DYNAMODB_TABLE_EVENT_LOG
);

const openSearchClient = createOpenSearchClient(OPENSEARCH_DOMAIN_ENDPOINT);

const dynamodbClient = createDynamodbClient(DYNAMODB_REGION, process.env.DYNAMODB_ENDPOINT);
export const userReadRepository = createOpenSearchReadRepository(
  dynamodbClient,
  openSearchClient,
  OPENSEARCH_USERS_PROJECTION_INDEX,
  DYNAMODB_TABLE_EVENT_LOG,
  userRepository
);
export const command = createCommandHandlers(userRepository, userReadRepository);
