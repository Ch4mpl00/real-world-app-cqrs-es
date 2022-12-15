import { Result } from '@badrap/result';
import { match } from 'ts-pattern';
import { ArticleDomainEvent, createArticleCreatedEvent } from 'src/components/article/domain/events';
import { ArticleAggregate, Tag } from 'src/components/article/domain/types';

type CreationData = {
    slug: string;
    title: string
    description: string
    body: string
    tagList: Tag[]
    authorId: string
}

export const applyEvent = (article: ArticleAggregate, event: ArticleDomainEvent): ArticleAggregate => {
  if (event.aggregateId !== article.id) {
    return article;
  }

  const state = match<ArticleDomainEvent, ArticleAggregate['state']>(event)
    .with({ type: 'ArticleCreated' }, (e) => e.payload)
    .exhaustive();

  if (!state) return article;

  // if event has version it means that event has been loaded from history
  if (event.version) {
    return {
      ...article,
      state,
      version: event.version,
      newEvents: article.newEvents ?? []
    };
  }

  const version = article.version + 1;

  return {
    ...article,
    state,
    version,
    newEvents: [...article.newEvents, { ...event, version }]
  };
};

const initialState = (id: string): ArticleAggregate => ({
  id,
  type: 'article',
  state: {} as ArticleAggregate['state'],
  newEvents: [],
  version: 0
});

export const restore = (id: string, events: readonly ArticleDomainEvent[]) => {
  if (events.length === 0) return null;

  return events.reduce((state, event) => applyEvent(state, event), initialState(id));
};

export const create = (
  id: string,
  data: CreationData,
  context: { timestamp: number }
): Result<ArticleAggregate, never> => {
  return Result.ok(
    applyEvent(initialState(id), createArticleCreatedEvent(id, data, context.timestamp))
  );
};
