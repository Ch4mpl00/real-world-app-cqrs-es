import { command, userReadRepository } from '@components/user';
import { match } from 'ts-pattern';
import middy from '@middy/core'
import jsonBodyParser from '@middy/http-json-body-parser'
import Joi from 'joi';
import { validate } from '@lib/middy-middlewares';
import { ensure } from '@lib/common';
import { ApiGatewayEventBody, ApiGatewayResponse } from '@lib/http';
import { v4 } from 'uuid';
import { SQSEvent } from 'aws-lambda';
import { Event } from '@components/common/events';

export const registerUserHandler = middy(async (event: ApiGatewayEventBody): Promise<ApiGatewayResponse> => {

  const id = event.body.id || v4();
  const result = await command.registerUser({ ...event.body, id });

  if (result.isOk) {
    const user = ensure(await userReadRepository.find(id, true), `user with id ${id} not found`)

    return {
      statusCode: 201,
      body: JSON.stringify(user)
    };
  }

  return match(result.error.name)
    .with('EmailAlreadyExists', (e) => ({
      statusCode: 422,
      body: JSON.stringify({ error: e, message: 'Email already exists' })
    }))
    .otherwise(() => ({
      statusCode: 500,
      body: JSON.stringify({ error: 'Something went wrong' })
    }))
})
  .use(jsonBodyParser())
  .use(validate({
    body: {
      id: Joi.string().optional(),
      email: Joi.string().email().required(),
      password: Joi.string().min(6).max(60).required(),
      username: Joi.string().max(60).required()
    }
  }))

export const onEvent = (event: SQSEvent) => {
  const records = event.Records;
  console.log(JSON.stringify(records, null, 2))
  records.map(async r => {
    const e = JSON.parse(r.body) as Event;
    await userReadRepository.onEvent(e)
  })
}
