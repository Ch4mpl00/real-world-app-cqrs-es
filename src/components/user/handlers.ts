import { command, userReadRepository } from 'src/components/user';
import { match } from 'ts-pattern';
import middy from '@middy/core';
import jsonBodyParser from '@middy/http-json-body-parser';
import Joi from 'joi';
import { validate } from 'src/lib/middy-middlewares';
import { DomainEvent, ensure } from 'src/lib/common';
import { ApiGatewayEventBody, ApiGatewayResponse, EventPath } from 'src/lib/http';
import { v4 } from 'uuid';
import { SQSEvent } from 'aws-lambda';
import jwt from 'src/lib/jwt';
import bcrypt from 'bcryptjs';
import { UserProjection } from 'src/components/user/readRepository';
import { omit } from 'lodash';
import { UserRegistered } from 'src/components/user/domain';

const createUserView = (user: UserProjection) => omit(user, ['password', 'version']);

export const registerUserHandler = middy(async (event: ApiGatewayEventBody): Promise<ApiGatewayResponse> => {
  const id = event.body.id || v4();
  const result = await command.registerUser({ ...event.body.user, id });

  if (result.isOk) {
    const user = ensure(await userReadRepository.find(id, true), `user with id ${id} not found`);
    const token = jwt.sign(user);

    return {
      statusCode: 201,
      body: JSON.stringify({ user: { ...createUserView(user), token } })
    };
  }

  return match(result.error)
    .with({ name: 'EmailAlreadyExists' }, (e) => ({
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
      user: Joi.object({
        id: Joi.string().optional(),
        email: Joi.string().email().required(),
        password: Joi.string().min(6).max(60).required(),
        username: Joi.string().max(60).required()
      })
    }
  }));

export const updateUserHandler = middy(async (event: ApiGatewayEventBody): Promise<ApiGatewayResponse> => {
  const id = event.requestContext.authorizer.principalId;
  const result = await command.updateUser(id, { ...event.body.user });

  if (result.isOk) {
    const user = ensure(await userReadRepository.find(id, true), `user with id ${id} not found`);
    const token = jwt.sign(user);

    return {
      statusCode: 200,
      body: JSON.stringify({ user: { ...createUserView(user), token } })
    };
  }

  return match(result.error)
    .with({ name: 'EmailAlreadyExists' }, (e) => ({
      statusCode: 422,
      body: JSON.stringify({ error: e.name, message: e.message })
    }))
    .with({ name: 'UserNotFound' }, (e) => ({
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
      user: Joi.object({
        email: Joi.string().email().required().optional(),
        password: Joi.string().min(6).max(60).required()
          .optional(),
        username: Joi.string().max(60).required().optional(),
        bio: Joi.string().max(60).required().optional()
      })
    }
  }));

export const loginHandler = middy(async (event: ApiGatewayEventBody): Promise<ApiGatewayResponse> => {
  const credentials = event.body.user;
  const user = await userReadRepository.findByEmail(credentials.email);

  if (user && (await bcrypt.compare(credentials.password, user.password))) {
    const token = jwt.sign(user);

    return {
      statusCode: 200,
      body: JSON.stringify({ user: { ...createUserView(user), token } })
    };
  }
  return {
    statusCode: 422,
    body: JSON.stringify({ error: 'InvalidCredentials', message: 'Wrong email or password' })
  };
})
  .use(jsonBodyParser())
  .use(validate({
    body: {
      user: Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().max(60).required()
      })
    }
  }));

export const getCurrentUserHandler = middy(async (event: ApiGatewayEventBody): Promise<ApiGatewayResponse> => {
  const user = await userReadRepository.find(event.requestContext.authorizer.principalId);

  if (!user) {
    return {
      statusCode: 404,
      body: JSON.stringify({ error: 'UserNotFound', message: 'User cannot be found' })
    };
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ user: { ...createUserView(user), token: jwt.sign(user) } })
  };
});

type UserProfileRequestEvent = ApiGatewayEventBody & EventPath<{ username: string }>
export const getUserProfileHandler = middy(async (event: UserProfileRequestEvent): Promise<ApiGatewayResponse> => {
  const user = await userReadRepository.findByUsername(event.pathParameters.username);

  if (!user) {
    return {
      statusCode: 404,
      body: JSON.stringify({ error: 'UserNotFound', message: 'User cannot be found' })
    };
  }

  let following = false;
  if (event.requestContext?.authorizer?.principalId) {
    const currentUser = ensure(await userReadRepository.find(event.requestContext.authorizer.principalId, true), 'Something went wrong');
    following = currentUser.follows.includes(user.id);
  }

  return {
    statusCode: 200,
    body: JSON.stringify({
      user: {
        ...createUserView(user),
        following
      }
    })
  };
});

type FollowUserRequest = ApiGatewayEventBody & EventPath<{ username: string }>
export const followUserHandler = middy(async (event: FollowUserRequest): Promise<ApiGatewayResponse> => {
  const currentUserId = event.requestContext.authorizer.principalId;
  const followee = await userReadRepository.findByUsername(event.pathParameters.username);
  if (!followee) {
    return {
      statusCode: 404,
      body: JSON.stringify({ error: 'UserNotFound', message: 'User cannot be found' })
    };
  }

  const result = await command.followUser(currentUserId, followee.id);
  const currentUser = ensure(await userReadRepository.find(currentUserId, true), 'Something went wrong');

  if (result.isOk) {
    return {
      statusCode: 200,
      body: JSON.stringify({
        user: {
          ...createUserView(followee),
          following: currentUser.follows.includes(followee.id)
        }
      })
    };
  }

  return match(result.error)
    .with({ name: 'UserNotFound' }, (e) => ({
      statusCode: 404,
      body: JSON.stringify({ error: e.name, message: e.message })
    }))
    .with({ name: 'CannotFollowYourself' }, (e) => ({
      statusCode: 404,
      body: JSON.stringify({ error: e.name, message: e.message })
    }))
    .otherwise(() => ({
      statusCode: 500,
      body: JSON.stringify({ error: 'InternalServerError', message: 'Internal server error' })
    }));
});

type UnfollowUserRequest = ApiGatewayEventBody & EventPath<{ username: string }>
export const unfollowUserHandler = middy(async (event: UnfollowUserRequest): Promise<ApiGatewayResponse> => {
  const currentUserId = event.requestContext.authorizer.principalId;
  const followee = await userReadRepository.findByUsername(event.pathParameters.username);
  if (!followee) {
    return {
      statusCode: 404,
      body: JSON.stringify({ error: 'UserNotFound', message: 'User cannot be found' })
    };
  }

  const result = await command.unfollowUser(currentUserId, followee.id);
  const currentUser = ensure(await userReadRepository.find(currentUserId, true), 'Something went wrong');

  if (result.isOk) {
    return {
      statusCode: 200,
      body: JSON.stringify({
        user: {
          ...createUserView(followee),
          following: currentUser.follows.includes(followee.id)
        }
      })
    };
  }

  return match(result.error)
    .with({ name: 'UserNotFound' }, (e) => ({
      statusCode: 404,
      body: JSON.stringify({ error: e.name, message: e.message })
    }))
    .otherwise(() => ({
      statusCode: 500,
      body: JSON.stringify({ error: 'InternalServerError', message: 'Internal server error' })
    }));
});

export const createUserProjectionHandler = (event: SQSEvent) => {
  const records = event.Records;

  records.map(async r => {
    const e = JSON.parse(r.body) as DomainEvent;
    await userReadRepository.onEvent(e);
  });
};

export const sendGreetingsEmailHandler = (event: SQSEvent) => {
  const records = event.Records;
  const events = records
    .map(r => JSON.parse(r.body) as DomainEvent)
    .filter((e): e is UserRegistered => e.type === 'UserRegistered');

  events.map(e => {
    // eslint-disable-next-line no-console
    console.log(`Sending greetings email to ${e.payload.email}`);
    return e;
  });
};
