import { UserDomainEvent, UserId } from 'src/components/user/domain';
import { DomainEvent, ensure } from 'src/lib/common';
import { match } from 'ts-pattern';
import { IUserRepository } from 'src/components/user/repository';
import { Result } from '@badrap/result';
import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import { Client } from '@opensearch-project/opensearch';
import { SearchResponse } from 'src/lib/opensearch';

export type UserProjection = Readonly<{
  id: string
  email: string
  username: string
  bio: string
  image: string | null
  follows: ReadonlyArray<UserId>
  createdAt: number
  updatedAt: number
  password: string
  version: number
}>

export const applyEvent = (user: UserProjection, event: DomainEvent) => {
  return match<UserDomainEvent, UserProjection>(event as UserDomainEvent)
    .with({ type: 'UserRegistered' }, (e) => ({
      id: e.aggregateId,
      email: e.payload.email,
      follows: [],
      bio: '',
      image: null,
      username: e.payload.username,
      createdAt: e.timestamp,
      updatedAt: e.timestamp,
      password: e.payload.password,
      version: ensure(e.version, 'event.version required')
    }))
    .with({ type: 'UserEmailChanged' }, (e) => ({
      ...user,
      email: e.payload.newEmail,
      updatedAt: e.timestamp,
      version: ensure(e.version, 'event.version required')
    }))
    .with({ type: 'UserProfileUpdated' }, (e) => ({
      ...user,
      updatedAt: e.timestamp,
      bio: e.payload.bio ?? user.bio,
      username: e.payload.username ?? user.username,
      image: e.payload.image !== undefined ? e.payload.image : user.image,
      version: ensure(e.version, 'event.version required')
    }))
    .with({ type: 'UserFollowed' }, (e) => ({
      ...user,
      updatedAt: e.timestamp,
      follows: [...user.follows, e.payload.followeeId],
      version: ensure(e.version, 'e.version required')
    }))
    .with({ type: 'UserUnfollowed' }, (e) => ({
      ...user,
      updatedAt: e.timestamp,
      follows: user.follows.filter(followedId => followedId !== e.payload.followeeId),
      version: ensure(e.version, 'event.version required')
    }))
    .exhaustive();
};

export type IUserReadRepository = {
  onEvent: (event: UserDomainEvent | DomainEvent) => Promise<void>
  find: (id: string, consistentRead?: boolean) => Promise<UserProjection | null>
  findByUsername: (username: string) => Promise<UserProjection | null>
  findByEmail: (id: string) => Promise<UserProjection | null>
  save: (projection: UserProjection) => Promise<Result<UserProjection, Error>>
}

export const createOpenSearchReadRepository = (
  dynamoDbClient: DocumentClient,
  openSearchClient: Client,
  indexName: string,
  dynamoDbTableName: string,
  userRepository: IUserRepository,
): IUserReadRepository => {
  const find = async (id: string, consistentRead = false): Promise<UserProjection | null> => {
    if (consistentRead) {
      const events = await userRepository.getEvents(id);

      if (events.length === 0) return null;
      if (events[0].type !== 'UserRegistered') {
        console.error(`Invalid events ordering for aggregate ${id}`);
        return null;
      }

      return events.reduce((state, event) => applyEvent(state, event), {} as UserProjection);
    }

    const res = await openSearchClient.search<SearchResponse<UserProjection>>({
      index: indexName,
      body: {
        query: { match: { _id: id } }
      }
    });

    return res.body.hits.hits[0]?._source.document;
  };

  const findByEmail = async (email: string): Promise<UserProjection | null> => {
    const res = await openSearchClient.search<SearchResponse<UserProjection>>({
      index: indexName,
      body: {
        query: { match: { 'document.email.keyword': email } }
      }
    });

    return res.body.hits.hits[0]?._source.document;
  };

  const findByUsername = async (username: string) => {
    const res = await openSearchClient.search<SearchResponse<UserProjection>>({
      index: indexName,
      body: {
        query: { match: { 'document.username.keyword': username } }
      }
    });

    return res.body.hits.hits[0]?._source.document;
  };

  const save = async (projection: UserProjection) => {
    return openSearchClient.index<SearchResponse<UserProjection>>({
      index: indexName,
      id: projection.id,
      body: {
        document: projection,
      },
    })
      .then(res => Result.ok(res.body.hits.hits[0]?._source.document))
      .catch(e => Result.err(e));
  };

  const onEvent = async (event: UserDomainEvent | DomainEvent) => {
    if (event.aggregate !== 'user') return;

    const projection = await find(event.aggregateId);

    await save(applyEvent(projection || {} as UserProjection, event));
  };

  return {
    find,
    findByUsername,
    findByEmail,
    save,
    onEvent,
  };
};
