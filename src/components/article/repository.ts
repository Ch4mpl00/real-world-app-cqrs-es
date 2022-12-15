import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import { createDynamodbEventLogRepository, IEventLogRepository } from 'src/lib/event-log-repository';
import { ArticleAggregate, ArticleDomainEvent, restore } from 'src/components/article/domain';

export type IArticleRepository = IEventLogRepository<ArticleDomainEvent, ArticleAggregate>

export const createDynamodbArticleRepository = (
  client: DocumentClient,
  tableName: string
): IArticleRepository => createDynamodbEventLogRepository(client, tableName, 'article', restore);
