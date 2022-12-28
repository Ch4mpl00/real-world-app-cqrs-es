import { Article } from './types';

export type ArticleCreated = Readonly<{
    type: 'ArticleCreated'
    version?: number
    timestamp: number
    aggregate: 'article'
    aggregateId: string,
    payload: Article
}>

export type ArticleUpdated = Readonly<{
    type: 'ArticleUpdated'
    version?: number
    timestamp: number
    aggregate: 'article'
    aggregateId: string,
    payload: Partial<Article>
}>

export type ArticleDomainEvent =
    | ArticleCreated
    | ArticleUpdated

export const createArticleCreatedEvent = (id: string, data: Article, timestamp: number): ArticleCreated => ({
  type: 'ArticleCreated',
  aggregate: 'article',
  aggregateId: id,
  payload: data,
  timestamp
});

export const createArticleUpdatedEvent = (id: string, data: Partial<Article>, timestamp: number): ArticleUpdated => ({
  type: 'ArticleUpdated',
  aggregate: 'article',
  aggregateId: id,
  payload: data,
  timestamp
});
