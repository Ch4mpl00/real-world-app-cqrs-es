import { Event, restore, UserAggregate } from '@components/user/domain';
import { Result } from "@badrap/result";
import { DocumentClient } from "aws-sdk/clients/dynamodb";

export type IUserRepository = {
  readonly get: (id: string) => Promise<UserAggregate | null>
  readonly getEvents: (id: string) => Promise<Event[]>
  readonly save: (user: UserAggregate) => Promise<Result<boolean, Error>>
}

const pkey = (id: string) => `user#${id}`

export const createDynamodbUserRepository = (client: DocumentClient, tableName: string): IUserRepository => ({
  get: async (aggregateId: string) => client.get({
    TableName: tableName,
    Key: { pkey: pkey(aggregateId) },
  })
    .promise()
    .then(res => {
      console.log('RES', JSON.stringify(res, null, 2))
      return restore(aggregateId, res as unknown as Event[])
    })
    .catch((err) => {
      console.log(err)
      return null;
    })
  ,
  getEvents: async (aggregateId: string) => client.query({
    TableName: tableName,
    ExpressionAttributeNames: {
      "#pkey": "pkey"
    },
    ExpressionAttributeValues: {
      ":pkeyValue": pkey(aggregateId),
    },
    KeyConditionExpression: "#pkey = :pkeyValue",
  })
    .promise()
    .then(res => {
      console.log(res);
      return res.Items as Event[]
    })
    .catch((err) => {
      console.log(err)
      return []
    }),

  save: (user: UserAggregate) => {
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
        console.log(err)
        return Result.err(err)
      })
  }

})
