import middy from '@middy/core';
import {
  ApiGatewayEventBody, ApiGatewayResponse, EventPath, PaginatedEventQuery
} from 'src/lib/http';
import { v4 } from 'uuid';
import { articleReadRepository, command } from 'src/components/article/index';
import jsonBodyParser from '@middy/http-json-body-parser';
import { validate } from 'src/lib/middy-middlewares';
import Joi from 'joi';
import { DomainEvent, ensure } from 'src/lib/common';
import { match } from 'ts-pattern';
import { SQSEvent } from 'aws-lambda';
import { createArticleApiView } from 'src/components/article/view';
import { ArticleQuery } from 'src/components/article/readRepository';
import httpEventNormalizer, { Event } from '@middy/http-event-normalizer';

export const createArticleHandler = middy(async (event: ApiGatewayEventBody): Promise<ApiGatewayResponse> => {
  const authorId = event.requestContext.authorizer.principalId;
  const id = event.body.id || v4();
  const result = await command.create(id, { ...event.body.article, authorId });

  if (result.isOk) {
    const article = ensure(
      await articleReadRepository.find(result.value.id, true),
      `article with id ${result.value.id} not found`
    );

    return {
      statusCode: 201,
      body: JSON.stringify({ article: createArticleApiView(article) })
    };
  }

  return match(result.error)
    .otherwise(() => ({
      statusCode: 500,
      body: JSON.stringify({ error: 'InternalServerError', message: 'Internal server error' })
    }));
})
  .use(jsonBodyParser())
  .use(validate({
    body: {
      article: Joi.object({
        id: Joi.string().optional(),
        title: Joi.string().max(60).required(),
        description: Joi.string().max(255).optional(),
        body: Joi.string().required(),
        tagList: Joi.array().items(Joi.string().max(60)).default([])
      })
    }
  }));

type UpdateArticleBySlugEvent = ApiGatewayEventBody & EventPath<{ slug: string }>
export const updateArticleBySlugHandler = middy(async (event: UpdateArticleBySlugEvent): Promise<ApiGatewayResponse> => {
  const { principalId } = event.requestContext.authorizer;
  const { slug } = event.pathParameters;
  const result = await command.updateBySlug(slug, { ...event.body.article }, { principalId });

  if (result.isOk) {
    const article = ensure(
      await articleReadRepository.find(result.value.id, true),
      `article with id ${result.value.id} not found`
    );

    return {
      statusCode: 200,
      body: JSON.stringify({ article: createArticleApiView(article) })
    };
  }

  return match(result.error)
    .with({ name: 'ArticleNotFound' }, (e) => ({
      statusCode: 404,
      body: JSON.stringify({ error: e.name, message: e.message })
    }))
    .with({ name: 'ArticleAuthorCannotBeChanged' }, (e) => ({
      statusCode: 422,
      body: JSON.stringify({ error: e.name, message: e.message })
    }))
    .otherwise(() => ({
      statusCode: 500,
      body: JSON.stringify({ error: 'InternalServerError', message: 'Internal server error' })
    }));
})
  .use(jsonBodyParser())
  .use(validate({
    body: {
      article: Joi.object({
        id: Joi.string().optional(),
        title: Joi.string().max(60).optional(),
        description: Joi.string().max(255).optional(),
        body: Joi.string().optional(),
        tagList: Joi.array().items(Joi.string().max(60)).optional()
      })
    }
  }));

type ArticleQueryReq = Event & PaginatedEventQuery<{
  author: string
  favorited: string
  tag: string
}>
export const getAllArticlesHandler = middy(async (event: ArticleQueryReq): Promise<ApiGatewayResponse> => {
  const queryParameters = event?.queryStringParameters || {};
  const query: ArticleQuery = {};

  if (queryParameters.author) {
    query.authorUsername = queryParameters.author;
  }

  if (queryParameters.tag) {
    query.tags = [queryParameters.tag];
  }

  if (queryParameters.favorited) {
    // TODO
  }

  const articles = await articleReadRepository.findMany(
    query,
    queryParameters.limit,
    queryParameters.offset
  );

  return {
    statusCode: 200,
    body: JSON.stringify({
      articles: articles.items.map(createArticleApiView),
      articlesCount: articles.total,
    })
  };
})
  .use(httpEventNormalizer())
  .use(validate({
    queryStringParameters: {
      limit: Joi.number().optional().default(20),
      offset: Joi.number().optional().default(0),
      author: Joi.string().optional(),
      favorited: Joi.string().optional(),
      tag: Joi.string().optional(),
    }
  }));

export const getArticleBySlugHandler = async (event: ApiGatewayEventBody & EventPath<{ slug: string }>) => {
  const { slug } = event.pathParameters;
  const article = await articleReadRepository.findBySlug(slug);

  if (!article) {
    return {
      statusCode: 404,
      body: JSON.stringify({ error: 'NotFound', message: `Article with slug ${slug} not found` })
    };
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ article: createArticleApiView(article) })
  };
};

export const createProjectionHandler = (event: SQSEvent) => {
  const records = event.Records;

  records.map(async r => {
    const e = JSON.parse(r.body) as DomainEvent;
    await articleReadRepository.onEvent(e);
  });
};
