import { createCommandHandlers } from 'src/components/article/commands';
import { createDynamodbClient } from 'src/lib/dynamodb';
import { ensure } from 'src/lib/common';
import { createDynamodbArticleRepository } from 'src/components/article/repository';
import { createOpenSearchArticleReadRepository } from 'src/components/article/readRepository';
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

const OPENSEARCH_ARTICLES_PROJECTION_INDEX = ensure(
  process.env.OPENSEARCH_ARTICLES_PROJECTION_INDEX,
  'process.env.OPENSEARCH_ARTICLES_PROJECTION_INDEX is not defined'
);

const OPENSEARCH_DOMAIN_ENDPOINT = ensure(
  process.env.OPENSEARCH_DOMAIN_ENDPOINT,
  'process.env.OPENSEARCH_DOMAIN_ENDPOINT required'
);

const dynamodbClient = createDynamodbClient(DYNAMODB_REGION, process.env.DYNAMODB_ENDPOINT);
export const articleRepository = createDynamodbArticleRepository(
  dynamodbClient,
  DYNAMODB_TABLE_EVENT_LOG
);

const openSearchClient = createOpenSearchClient(OPENSEARCH_DOMAIN_ENDPOINT);
export const articleReadRepository = createOpenSearchArticleReadRepository(
  openSearchClient,
  OPENSEARCH_ARTICLES_PROJECTION_INDEX,
  dynamodbClient,
  DYNAMODB_TABLE_EVENT_LOG,
  articleRepository
);

export const command = createCommandHandlers(articleRepository, articleReadRepository);
