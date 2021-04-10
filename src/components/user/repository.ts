import { Event, restore, UserAggregate } from '@components/user/domain';
import { error, ok, Result } from '@lib/monad';
import { DocumentClient } from "aws-sdk/clients/dynamodb";

export type IUserRepository = {
  readonly get: (id: string) => Promise<UserAggregate | null>
  readonly getEvents: (id: string) => Promise<Event[]>
  readonly save: (user: UserAggregate) => Promise<Result<boolean, Error>>
}

export const createDynamodbUserRepository = (client: DocumentClient, tableName: string): IUserRepository => ({
  get: async (aggregateId: string) => client.get({
    TableName: tableName,
    Key: { pkey: aggregateId },
  })
    .promise()
    .then(res => restore(aggregateId, res as unknown as Event[]))
    .catch(() => null)
  ,
  getEvents: async (aggregateId: string) => client.get({
    TableName: tableName,
    Key: { pkey: aggregateId },
  })
    .promise()
    .then(res => res as unknown as Event[])
    .catch(() => [])
  ,
  save: async (user: UserAggregate) => client.put({
    TableName: tableName,
    Item: user
  })
    .promise()
    .then(() => ok(true))
    .catch((err) => error(err))
})
