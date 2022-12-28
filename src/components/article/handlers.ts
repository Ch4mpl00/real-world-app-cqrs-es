import middy from '@middy/core';
import { ApiGatewayEventBody, ApiGatewayResponse, EventPath } from 'src/lib/http';
import { v4 } from 'uuid';
import { articleReadRepository, command } from 'src/components/article/index';
import jsonBodyParser from '@middy/http-json-body-parser';
import { validate } from 'src/lib/middy-middlewares';
import Joi from 'joi';
import { DomainEvent, ensure } from 'src/lib/common';
import { match } from 'ts-pattern';
import { SQSEvent } from 'aws-lambda';

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
      body: JSON.stringify({ article })
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
      body: JSON.stringify({ article })
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

export const createProjectionHandler = (event: SQSEvent) => {
  const records = event.Records;

  records.map(async r => {
    const e = JSON.parse(r.body) as DomainEvent;
    await articleReadRepository.onEvent(e);
  });
};
