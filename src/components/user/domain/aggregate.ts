import { Result } from '@badrap/result';
import {
  createEmailAlreadyExistsError,
  createUserFollowedEvent,
  createUserRegisteredEvent, createUserUnfollowedEvent,
  EmailAlreadyExists,
  createUserEmailChangedEvent,
  createUserProfileUpdatedEvent,
  Event,
  UserId,
  RegisterUserData,
  UserAggregate,
  UpdateUserData
} from 'src/components/user/domain';
import { match } from 'ts-pattern';
import { isEmpty } from 'lodash';

const initialState = (id: string): UserAggregate => ({
  id,
  type: 'user',
  state: {} as UserAggregate['state'],
  newEvents: [],
  version: 0
});

export const applyEvent = (user: UserAggregate, event: Event): UserAggregate => {
  if (event.aggregateId !== user.id) {
    return user;
  }

  const state = match<Event, UserAggregate['state']>(event)
    .with({ type: 'UserRegistered' }, (e) => ({
      email: e.payload.email,
      password: e.payload.password,
      follows: [],
      bio: '',
      image: null,
      username: e.payload.username
    }))
    .with({ type: 'UserEmailChanged' }, (e) => ({
      ...user.state,
      email: e.payload.newEmail
    }))
    .with({ type: 'UserProfileUpdated' }, (e) => ({
      ...user.state,
      bio: e.payload.bio ?? user.state.bio,
      username: e.payload.username ?? user.state.username,
      image: e.payload.image !== undefined ? e.payload.image : user.state.image
    }))
    .with({ type: 'UserFollowed' }, (e) => ({
      ...user.state,
      follows: [...user.state.follows, e.payload.followeeId]
    }))
    .with({ type: 'UserUnfollowed' }, (e) => ({
      ...user.state,
      follows: user.state.follows.filter(followedId => followedId !== e.payload.followeeId)
    }))
    .exhaustive();

  if (!state) return user;

  // if event has version it means that event has been loaded from history
  if (event.version) {
    return {
      ...user,
      state,
      version: event.version,
      newEvents: user.newEvents ?? []
    };
  }

  const version = user.version + 1;

  return {
    ...user,
    state,
    version,
    newEvents: [...user.newEvents, { ...event, version }]
  };
};

export const restore = (id: UserId, events: readonly Event[]) => {
  return events.reduce((state, event) => applyEvent(state, event), { id } as UserAggregate);
};

type UserRegistrationContext = {
  readonly emailAlreadyExists: boolean
  readonly timestamp: number
}

export const registerUser = (
  id: UserId,
  data: RegisterUserData,
  context: UserRegistrationContext
): Result<UserAggregate, EmailAlreadyExists> => {
  if (context.emailAlreadyExists) {
    return Result.err({ name: 'EmailAlreadyExists', message: '', email: data.email });
  }

  return Result.ok(
    applyEvent(initialState(id), createUserRegisteredEvent(id, data, context.timestamp))
  );
};

type UpdateUserContext = {
  readonly emailAlreadyExists: boolean
  readonly timestamp: number
}

export const updateUser = (
  user: UserAggregate,
  data: UpdateUserData,
  context: UpdateUserContext
): Result<UserAggregate, EmailAlreadyExists> => {
  const events = [];

  if (isEmpty(data)) return Result.ok(user);

  if (data.email !== undefined && data.email !== user.state.email) {
    if (context.emailAlreadyExists) return Result.err(createEmailAlreadyExistsError(data.email));
    events.push(createUserEmailChangedEvent(user.id, data.email, user.state.email, context.timestamp));
  }

  events.push(createUserProfileUpdatedEvent(user.id, data, context.timestamp));

  return Result.ok(
    events.reduce((u, e) => applyEvent(u, e), user)
  );
};

export const followUser = (user: UserAggregate, followeeId: UserId, context: { timestamp: number }): Result<UserAggregate, never> => {
  if (user.state.follows.includes(followeeId)) return Result.ok(user);

  return Result.ok(
    applyEvent(user, createUserFollowedEvent(user.id, followeeId, context.timestamp))
  );
};

export const unfollowUser = (user: UserAggregate, followeeId: UserId, context: { timestamp: number }): Result<UserAggregate, never> => {
  if (!user.state.follows.includes(followeeId)) return Result.ok(user);

  return Result.ok(
    applyEvent(user, createUserUnfollowedEvent(user.id, followeeId, context.timestamp))
  );
};
