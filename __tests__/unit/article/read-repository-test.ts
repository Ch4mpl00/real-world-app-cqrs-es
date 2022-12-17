import { applyEvent } from 'src/components/article/readRepository'
import { createArticleCreatedEvent, createRegistrationData } from '../../factories';
import { ArticleProjection } from '../../../src/components/article/readRepository';
import { createUserRegisteredEvent } from 'src/components/user/domain';

describe('Article read repository test', () => {
  test('it should apply ArticleCreated event', () => {
    const event = createArticleCreatedEvent();

    const articleProjection = applyEvent({} as ArticleProjection, event);

    expect(articleProjection).toStrictEqual({
      id: event.aggregateId,
      version: 1,
      title: event.payload.title,
      slug: event.payload.slug,
      description: event.payload.description,
      body: event.payload.body,
      favoritesCount: 0,
      tagList: [],
      createdAt: event.timestamp,
      updatedAt: event.timestamp,
      author: undefined, // as we don't have any author events here
    })
  })

  test('it should apply UserRegistered event', () => {
    const event = createArticleCreatedEvent();
    let articleProjection = applyEvent({} as ArticleProjection, event);
    const userData = createRegistrationData();
    const userRegisteredEvent = createUserRegisteredEvent(userData.id, userData, new Date().getTime());
    articleProjection = applyEvent(articleProjection, userRegisteredEvent);

    expect(articleProjection.author).toStrictEqual({
      id: userRegisteredEvent.aggregateId,
      username: userRegisteredEvent.payload.username,
      bio: null,
      image: null
    })
  })

})