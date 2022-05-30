import { createDynamodbUserRepository } from '@components/user/repository';
import { createDynamoDbReadRepository } from '@components/user/readRepository';
import { createCommandHandlers } from '@components/user/commands';
import { createDynamodbClient } from '@lib/dynamodb';
import { ensure } from '@lib/common';

const DYNAMODB_REGION = ensure(process.env.DYNAMODB_REGION, 'process.env.DYNAMODB_REGION is not defined');
const DYNAMODB_TABLE_EVENT_LOG = ensure(process.env.DYNAMODB_TABLE_EVENT_LOG, 'process.env.DYNAMODB_TABLE_EVENT_LOG is not defined');
const DYNAMODB_TABLE_USER_PROJECTION = ensure(process.env.DYNAMODB_TABLE_USER_PROJECTION, 'process.env.DYNAMODB_TABLE_USER_PROJECTION is not defined');

const dynamodbEventLogClient = createDynamodbClient(DYNAMODB_REGION, process.env.DYNAMODB_ENDPOINT)
export const userRepository = createDynamodbUserRepository(
  dynamodbEventLogClient,
  DYNAMODB_TABLE_EVENT_LOG
);

const dynamodbUserProjectionClient = createDynamodbClient(DYNAMODB_REGION, process.env.DYNAMODB_ENDPOINT)
export const userReadRepository = createDynamoDbReadRepository(
  dynamodbUserProjectionClient,
  DYNAMODB_TABLE_USER_PROJECTION,
  userRepository
)
export const command = createCommandHandlers(userRepository, userReadRepository);
