import { createCommandHandlers } from 'src/components/article/commands';
import { createDynamodbClient } from 'src/lib/dynamodb';
import { ensure } from 'src/lib/common';
import { createDynamodbArticleRepository } from 'src/components/article/repository';

const DYNAMODB_REGION = ensure(
  process.env.DYNAMODB_REGION,
  'process.env.DYNAMODB_REGION is not defined'
);

const DYNAMODB_TABLE_EVENT_LOG = ensure(
  process.env.DYNAMODB_TABLE_EVENT_LOG,
  'process.env.DYNAMODB_TABLE_EVENT_LOG is not defined'
);
//
// const DYNAMODB_TABLE_ARTICLE_PROJECTION = ensure(
//   process.env.DYNAMODB_TABLE_ARTICLE_PROJECTION,
//   'process.env.DYNAMODB_TABLE_ARTICLE_PROJECTION is not defined'
// );

const dynamodbEventLogClient = createDynamodbClient(DYNAMODB_REGION, process.env.DYNAMODB_ENDPOINT);
export const articleRepository = createDynamodbArticleRepository(
  dynamodbEventLogClient,
  DYNAMODB_TABLE_EVENT_LOG
);
//
// const dynamodbUserProjectionClient = createDynamodbClient(DYNAMODB_REGION, process.env.DYNAMODB_ENDPOINT);
// export const userReadRepository = createDynamoDbReadRepository(
//   dynamodbUserProjectionClient,
//   DYNAMODB_TABLE_ARTICLE_PROJECTION,
//   articleRepository
// );
export const command = createCommandHandlers(articleRepository);
