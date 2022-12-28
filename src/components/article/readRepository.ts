import { Result } from '@badrap/result';
import { DomainEvent, ensure } from 'src/lib/common';
import { match } from 'ts-pattern';
import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import { Client } from '@opensearch-project/opensearch';
import { SearchResponse } from 'src/lib/opensearch';
import { ArticleCreated } from './domain';
import { IArticleRepository } from './repository';

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
    .with({ type: 'ArticleUpdated' }, (e) => ({
      ...state,
      ...e.payload,
      version: ensure(e.version, 'event.version required'),
      updatedAt: e.timestamp,
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
  findByAuthorUsername: (username: string) => Promise<ArticleProjection | null>
  findBySlug: (slug: string) => Promise<ArticleProjection | null>
  save: (projection: ArticleProjection) => Promise<Result<ArticleProjection, Error>>
  onEvent: (event: DomainEvent) => Promise<void>
}

export const createOpenSearchArticleReadRepository = (
  openSearchClient: Client,
  indexName: string,
  dynamoDbClient: DocumentClient,
  dynamoDbTableName: string,
  articleRepository: IArticleRepository,
): IArticleReadRepository => {
  const findWithConsistentRead = async (id: string): Promise<ArticleProjection | null> => {
    const events = await articleRepository.getEvents(id);

    if (events.length === 0) return null;
    if (events[0].type !== 'ArticleCreated') {
      console.error(`Invalid events ordering for aggregate ${id}`);
      return null;
    }

    const { authorId } = (events[0] as ArticleCreated).payload;
    const authorEvents = await articleRepository.getAuthorEvents(authorId);

    return [...events, ...authorEvents].reduce((state, event) => applyEvent(state, event), {} as ArticleProjection);
  };

  const find = async (id: string, consistentRead = false): Promise<ArticleProjection | null> => {
    if (consistentRead) return findWithConsistentRead(id);

    const res = await openSearchClient.search<SearchResponse<ArticleProjection>>({
      index: indexName,
      body: {
        query: { match: { _id: id } }
      }
    });

    return res.body.hits.hits[0]?._source.document;
  };

  const findByAuthorUsername = async (username: string): Promise<ArticleProjection | null> => {
    const res = await openSearchClient.search<SearchResponse<ArticleProjection>>({
      index: indexName,
      body: {
        query: { match: { 'document.author.username.keyword': username } }
      }
    });

    return res.body.hits.hits[0]?._source.document;
  };

  const findBySlug = async (slug: string): Promise<ArticleProjection | null> => {
    const res = await openSearchClient.search<SearchResponse<ArticleProjection>>({
      index: indexName,
      body: {
        query: { match: { 'document.slug.keyword': slug } }
      }
    });

    return res.body.hits.hits[0]?._source.document;
  };

  const save = async (projection: ArticleProjection) => {
    return openSearchClient.index<SearchResponse<ArticleProjection>>({
      index: indexName,
      id: projection.id,
      body: {
        document: projection,
      },
    })
      .then(res => Result.ok(res.body.hits.hits[0]?._source.document))
      .catch(e => Result.err(e));
  };

  const onEvent = async (event: DomainEvent) => {
    if (event.aggregate !== 'article') return;
    // TODO: update all author's articles also

    const projection = await find(event.aggregateId);

    await save(applyEvent(projection || {} as ArticleProjection, event));
  };

  return {
    find,
    findByAuthorUsername,
    findBySlug,
    save,
    onEvent,
  };
};
