import { Event, Profile, UserId } from '@components/user/domain'
import { DomainEvent } from '@lib/common';
import { match } from 'ts-pattern';
import { IUserRepository } from '@components/user/repository';
import { Result } from '@badrap/result';
import { DocumentClient } from 'aws-sdk/clients/dynamodb';

export type UserProjection = {
  readonly id: string
  readonly email: string
  readonly profile: Profile
  readonly follows: ReadonlyArray<UserId>
  readonly createdAt: number
  readonly updatedAt: number
  readonly version: number
}

export type IUserReadRepository = {
  onEvent: (event: Event | DomainEvent) => Promise<void>
  find: (id: string, consistentRead?: boolean) => Promise<UserProjection | null>
  findByEmail: (id: string) => Promise<UserProjection | null>
  save: (projection: UserProjection) => Promise<Result<UserProjection, Error>>
}

export const createDynamoDbReadRepository = (
  client: DocumentClient,
  tableName: string,
  userRepository: IUserRepository,
): IUserReadRepository => {

  const find = async (id: string, consistentRead: boolean = false): Promise<UserProjection | null> => {

    if (consistentRead) {
      const events = await userRepository.getEvents(id);

      if (events.length === 0) return null;

      // TODO: default state instead of type casting
      return events.reduce((state, event) => applyEventsOnUserProjection(state, event), {} as UserProjection)
    }

    return null
  }

  const findByEmail = async (email: string): Promise<UserProjection | null> => {
    return client.query({
      TableName: tableName,
      IndexName: 'email',
      KeyConditionExpression: "#email = :emailValue",
      ExpressionAttributeNames: {
        "#email": "email"
      },
      ExpressionAttributeValues: {
        ":emailValue": email,
      },
    })
      .promise()
      .then(res => res as UserProjection | null)
  }

  const save = async (projection: UserProjection) => {
    return client.put({
      TableName: tableName,
      Item: projection,
    })
      .promise()
      .then(() => Result.ok(projection))
      .catch(Result.err)
  }

  const onEvent = async (event: Event | DomainEvent) => {
    if (event.aggregate !== 'user') return;

    const projection = await find(event.aggregateId);

    await save(applyEventsOnUserProjection(projection, event))
  }

  return {
    onEvent,
    find,
    findByEmail,
    save
  }
}

export const applyEventsOnUserProjection = (state: UserProjection | null, event: DomainEvent) => {
  let user = state || {} as UserProjection; // TODO: initial state

  return match<Event, UserProjection>(event as Event)
    .with({ type: 'UserRegistered' }, (event) => ({
      id: event.aggregateId,
      email: event.payload.email,
      follows: [],
      profile: {
        bio: '',
        image: null,
        username: event.payload.username
      },
      createdAt: event.timestamp,
      updatedAt: event.timestamp,
      version: event.version!
    }))
    .with({ type: 'UserEmailChanged' }, (event) => ({
      ...user,
      email: event.payload.newEmail,
      updatedAt: event.timestamp,
      version: event.version!
    }))
    .with({ type: 'UserProfileUpdated' }, (event) => ({
      ...user,
      updatedAt: event.timestamp,
      profile: {
        bio: event.payload.bio ?? user.profile.bio,
        username: event.payload.username ?? user.profile.username,
        image: event.payload.image !== undefined ? event.payload.image : user.profile.image,
      },
      version: event.version!
    }))
    .with({ type: 'UserFollowed' }, (event) => ({
      ...user,
      updatedAt: event.timestamp,
      follows: [...user.follows, event.payload.followedTo],
      version: event.version!
    }))
    .with({ type: 'UserUnfollowed' }, (event) => ({
      ...user,
      updatedAt: event.timestamp,
      follows: user.follows.filter(followedId => followedId !== event.payload.unfollowedFrom),
      version: event.version!
    }))
    .exhaustive()
}
