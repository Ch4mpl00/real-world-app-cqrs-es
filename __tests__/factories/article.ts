import { faker } from '@faker-js/faker';
import { ArticleCreated, createArticleCreatedEvent as _createArticleCreatedEvent } from '../../src/components/article/domain/events';
import slugify from 'slugify';

export const createArticleCreatedEvent = (id?: string, vals?: Partial<ArticleCreated>): ArticleCreated => {
  id ??= faker.datatype.uuid();
  const title = faker.lorem.sentence();

  const e = _createArticleCreatedEvent(id, {
    title,
    slug: slugify(title),
    description: faker.lorem.sentence(),
    body: faker.lorem.sentences(3),
    tagList: [],
    authorId: faker.datatype.uuid(),
    ...vals
  }, new Date().getTime());

  return { ...e, version: 1 }
}
