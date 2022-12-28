import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import { createDynamodbEventLogRepository, IEventLogRepository } from 'src/lib/event-log-repository';
import { ArticleAggregate, ArticleDomainEvent, restore } from 'src/components/article/domain';
import { DomainEvent } from 'src/lib/common';

export type IArticleRepository = IEventLogRepository<ArticleDomainEvent, ArticleAggregate> & {
    readonly getAuthorEvents: (authorId: string) => Promise<DomainEvent[]>
}

const authorPkey = (id: string) => `user#${id}`;

export const createDynamodbArticleRepository = (
  client: DocumentClient,
  tableName: string
): IArticleRepository => ({
  ...createDynamodbEventLogRepository(client, tableName, 'article', restore),

  getAuthorEvents: (authorId: string): Promise<DomainEvent[]> => client.query({
    TableName: tableName,
    ExpressionAttributeNames: {
      '#pkey': 'pkey'
    },
    ExpressionAttributeValues: {
      ':pkeyValue': authorPkey(authorId)
    },
    KeyConditionExpression: '#pkey = :pkeyValue'
  })
    .promise()
    .then(res => res.Items as DomainEvent[])
});
