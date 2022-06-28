import { createDynamodbUserRepository } from 'src/components/user/repository';
import { createDynamoDbReadRepository } from 'src/components/user/readRepository';
import { createCommandHandlers } from 'src/components/user/commands';
import { createDynamodbClient } from 'src/lib/dynamodb';
import { ensure } from 'src/lib/common';

const DYNAMODB_REGION = ensure(
  process.env.DYNAMODB_REGION,
  'process.env.DYNAMODB_REGION is not defined'
);

const DYNAMODB_TABLE_EVENT_LOG = ensure(
  process.env.DYNAMODB_TABLE_EVENT_LOG,
  'process.env.DYNAMODB_TABLE_EVENT_LOG is not defined'
);

const DYNAMODB_TABLE_USER_PROJECTION = ensure(
  process.env.DYNAMODB_TABLE_USER_PROJECTION,
  'process.env.DYNAMODB_TABLE_USER_PROJECTION is not defined'
);

const dynamodbEventLogClient = createDynamodbClient(DYNAMODB_REGION, process.env.DYNAMODB_ENDPOINT);
export const userRepository = createDynamodbUserRepository(
  dynamodbEventLogClient,
  DYNAMODB_TABLE_EVENT_LOG
);

const dynamodbUserProjectionClient = createDynamodbClient(DYNAMODB_REGION, process.env.DYNAMODB_ENDPOINT);
export const userReadRepository = createDynamoDbReadRepository(
  dynamodbUserProjectionClient,
  DYNAMODB_TABLE_USER_PROJECTION,
  userRepository
);
export const command = createCommandHandlers(userRepository, userReadRepository);
