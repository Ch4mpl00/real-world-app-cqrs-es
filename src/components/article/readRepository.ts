import { Result } from '@badrap/result';
import { DomainEvent, ensure } from 'src/lib/common';
import { match } from 'ts-pattern';
import { ArticleCreated } from './domain';
import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import { IArticleRepository } from './repository';
import { IEventLogRepository } from '../../lib/event-log-repository';
import { UserAggregate } from '../user/domain/types';

type ArticleAuthor = Readonly<{
  id: string
  username: string
  bio: string | null
  image: string | null
}>

export type ArticleProjection = Readonly<{
  id: string
  slug: string
  title: string
  description: string
  body: string
  tagList: string[]
  createdAt: number
  updatedAt: number
  favoritesCount: number
  author: ArticleAuthor
  version: number
}>

export const applyEvent = (
  state: ArticleProjection,
  event: DomainEvent
): ArticleProjection => {

  return match<DomainEvent, ArticleProjection>(event)
    .with({ type: 'ArticleCreated' }, (e) => ({
      id: e.aggregateId,
      slug: e.payload.slug,
      title: e.payload.title,
      description: e.payload.description,
      body: e.payload.body,
      tagList: e.payload.tagList,
      favoritesCount: 0,
      version: ensure(e.version, 'event.version required'),
      createdAt: e.timestamp,
      updatedAt: e.timestamp,
      author: state.author
    }))
    .with({ type: 'UserRegistered' }, (e) => ({
      ...state,
      author: {
        id: e.aggregateId,
        username: e.payload.username,
        bio: null,
        image: null,
      }
    }))
    .with({ type: 'UserProfileUpdated' }, (e) => ({
      ...state,
      author: {
        id: e.aggregateId,
        username: e.payload.username ?? state.author.username,
        bio: e.payload.bio ?? state.author.bio,
        image: e.payload.image ?? state.author.image,
      }
    }))
    .run();
};


export type IArticleReadRepository = {
  find: (id: string, consistentRead?: boolean) => Promise<ArticleProjection | null>
  save: (projection: ArticleProjection) => Promise<Result<ArticleProjection, Error>>
  onEvent: (event: DomainEvent) => Promise<void>
}


export const createDynamoDbReadRepository = (
  client: DocumentClient,
  tableName: string,
  articleRepository: IArticleRepository,
  eventLogRepository: IEventLogRepository<DomainEvent, UserAggregate>
): IArticleReadRepository => {

  const find = async (id: string, consistentRead = false): Promise<ArticleProjection | null> => {
    if (consistentRead) {
      const events = await articleRepository.getEvents(id);

      if (events.length === 0) return null;
      if (events[0].type !== 'ArticleCreated') {
        console.error(`Invalid events ordering for aggregate ${id}`);
        return null;
      }

      const authorId = (events[0] as ArticleCreated).payload.authorId;
      const authorEvents = await eventLogRepository.getEvents(authorId);

      return [...events, ...authorEvents].reduce((state, event) => applyEvent(state, event), {} as ArticleProjection);
    }

    return client.query({
      TableName: tableName,
      KeyConditionExpression: '#id = :idValue',
      ExpressionAttributeNames: {
        '#id': 'id'
      },
      ExpressionAttributeValues: {
        ':idValue': id
      }
    })
      .promise()
      .then(res => res.Items?.pop() as ArticleProjection)
      .catch(() => null);
  };

  const onEvent = async (event: DomainEvent) => {
    if (event.aggregate !== 'article') return;

    const projection = await find(event.aggregateId);

    await save(applyEvent(projection || {} as ArticleProjection, event));
  };

  const save = async (projection: ArticleProjection) => {
    return client.put({
      TableName: tableName,
      Item: projection
    })
      .promise()
      .then(() => Result.ok(projection))
      .catch(Result.err);
  };

  return {
    find,
    save,
    onEvent,
  }
}

