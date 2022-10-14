import { UserDomainEvent, restore, UserAggregate } from 'src/components/user/domain';
import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import { createDynamodbEventLogRepository, IEventLogRepository } from 'src/lib/event-log-repository';

export type IUserRepository = IEventLogRepository<UserDomainEvent, UserAggregate>

export const createDynamodbUserRepository = (
  client: DocumentClient,
  tableName: string
): IUserRepository => createDynamodbEventLogRepository(client, tableName, 'user', restore);
