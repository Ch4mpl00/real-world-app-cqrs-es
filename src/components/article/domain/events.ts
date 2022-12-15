import { Article } from './types';

export type ArticleCreated = Readonly<{
    type: 'ArticleCreated'
    version?: number
    timestamp: number
    aggregate: 'article'
    aggregateId: string,
    payload: Article
}>

export type ArticleDomainEvent =
    | ArticleCreated

export const createArticleCreatedEvent = (id: string, data: Article, timestamp: number): ArticleCreated => ({
  type: 'ArticleCreated',
  aggregate: 'article',
  aggregateId: id,
  payload: data,
  timestamp
});
