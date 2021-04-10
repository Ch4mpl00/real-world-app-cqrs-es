import { createDynamodbUserRepository } from '@components/user/repository';
import { createDynamoDbReadRepository } from '@components/user/readRepository';
import { createCommandHandlers } from '@components/user/commands';
import { createDynamodbClient } from '@lib/dynamodb';
import { ensure } from '@lib/common';

const AWS_REGION = ensure(process.env.AWS_REGION, 'process.env.AWS_REGION is not defined');
const DYNAMODB_TABLE_EVENT_LOG = ensure(process.env.DYNAMODB_TABLE_EVENT_LOG, 'process.env.DYNAMODB_TABLE_EVENT_LOG is not defined');

const dynamodbClient = createDynamodbClient(AWS_REGION)
export const userRepository = createDynamodbUserRepository(
  dynamodbClient,
  DYNAMODB_TABLE_EVENT_LOG
);

export const userReadRepository = createDynamoDbReadRepository(userRepository)
export const command = createCommandHandlers(userRepository, userReadRepository);
