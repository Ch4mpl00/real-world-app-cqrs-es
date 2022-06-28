import { Event, restore, UserAggregate } from 'src/components/user/domain';
import { Result } from '@badrap/result';
import { DocumentClient } from 'aws-sdk/clients/dynamodb';

export type IUserRepository = {
  readonly get: (id: string) => Promise<UserAggregate | null>
  readonly getEvents: (id: string) => Promise<Event[]>
  readonly save: (user: UserAggregate) => Promise<Result<boolean, Error>>
}

const pkey = (id: string) => `user#${id}`;

export const createDynamodbUserRepository = (client: DocumentClient, tableName: string): IUserRepository => {
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
    .then(res => res.Items as Event[])
    .catch((err) => {
      // eslint-disable-next-line no-console
      console.log(err);
      return [];
    });

  const get = async (aggregateId: string) => getEvents(aggregateId)
    .then(res => restore(aggregateId, res as unknown as Event[]))
    .catch((err) => {
      // eslint-disable-next-line no-console
      console.log(err);
      return null;
    });

  const save = (user: UserAggregate) => {
    return client.transactWrite({
      TransactItems: user.newEvents.map(event => ({
        Put: {
          TableName: tableName,
          Item: { ...event, pkey: pkey(user.id) },
          ConditionExpression: 'attribute_not_exists(pkey)'
        }
      }))
    })
      .promise()
      .then(() => Result.ok(true))
      .catch((err) => {
        // eslint-disable-next-line no-console
        console.log(err);
        return Result.err(err);
      });
  };

  return {
    get, getEvents, save
  };
};
