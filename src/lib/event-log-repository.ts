import { DocumentClient } from 'aws-sdk/clients/dynamodb';

export type IEventLogRepository<E, T extends { newEvents: E[] }> = {
  readonly get: (id: string) => Promise<T | null>
  readonly getEvents: (id: string) => Promise<E[]>
  readonly save: (aggregate: T) => Promise<boolean>
}

export const createDynamodbEventLogRepository = <E, T extends { newEvents: E[], type: string, id: string }> (
  client: DocumentClient,
  tableName: string,
  pkeyPrefix: T['type'],
  restore: (id: string, events: E[]) => T | null
): IEventLogRepository<E, T> => {
  const pkey = (id: string) => `${pkeyPrefix}#${id}`;

  const getEvents = async (aggregateId: string) => client.query({
    TableName: tableName,
    ExpressionAttributeNames: {
      '#pkey': 'pkey'
    },
    ExpressionAttributeValues: {
      ':pkeyValue': pkey(aggregateId)
    },
    KeyConditionExpression: '#pkey = :pkeyValue'
  })
    .promise()
    .then(res => res.Items as E[]);

  const get = async (aggregateId: string) => getEvents(aggregateId)
    .then(res => restore(aggregateId, res));

  const save = (aggregate: T) => {
    return client.transactWrite({
      TransactItems: aggregate.newEvents.map(event => ({
        Put: {
          TableName: tableName,
          Item: { ...event, pkey: pkey(aggregate.id) },
          ConditionExpression: 'attribute_not_exists(pkey)'
        }
      }))
    })
      .promise()
      .then(() => true);
  };

  return {
    get, getEvents, save
  };
};
