import { Result } from '@badrap/result';
import { createEmailAlreadyExistsError, createUserRegisteredEvent, EmailAlreadyExists } from '@components/user/domain'
import {
  createUserEmailChangedEvent,
  createUserProfileUpdatedEvent,
  Event,
  UserFollowed,
  UserUnfollowed,
  UserId,
  RegisterUserData,
  UserAggregate,
  UpdateUserData
} from '@components/user/domain'
import { match } from 'ts-pattern';

const initialState = (id: string): UserAggregate => ({
  id,
  type: 'user',
  state: {} as UserAggregate['state'],
  events: [],
  version: 0
})

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
    return Result.err({ name: 'EmailAlreadyExists', message: '', email: data.email })
  }

  return Result.ok(
    applyEvent(initialState(id), createUserRegisteredEvent(id, data, context.timestamp))
  )
}

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

  if (data.email !== undefined) {
    if (context.emailAlreadyExists) return Result.err(createEmailAlreadyExistsError(data.email))
    if (data.email !== user.state.email) {
      events.push(createUserEmailChangedEvent(user.id, data.email, user.state.email, context.timestamp))
    }
  }

  events.push(createUserProfileUpdatedEvent(user.id, data, context.timestamp))

  return Result.ok(
    events.reduce((u, e) => applyEvent(u, e), user)
  )
}

export const followUser = (user: UserAggregate, userIdToFollow: UserId, timestamp: number): Result<UserFollowed, never> => {
  return Result.ok({
    aggregateId: user.id,
    aggregate: 'user',
    type: 'UserFollowed',
    timestamp,
    payload: {
      followedTo: userIdToFollow
    }
  })
}

export const unfollowUser = (user: UserAggregate, userIdToUnfollow: UserId, timestamp: number): Result<UserUnfollowed, never> => {
  return Result.ok({
    aggregateId: user.id,
    aggregate: 'user',
    type: 'UserUnfollowed',
    timestamp,
    payload: {
      unfollowedFrom: userIdToUnfollow
    }
  })
}

export const applyEvent = (user: UserAggregate, event: Event): UserAggregate => {
  if (event.aggregateId !== user.id) {
    return user
  }

  const state = match<Event, UserAggregate['state']>(event)
    .with({ type: 'UserRegistered' }, (e) => ({
      email: e.payload.email,
      password: e.payload.password,
      follows: [],
      profile: {
        bio: '',
        image: null,
        username: e.payload.username
      }
    }))
    .with({ type: 'UserEmailChanged' }, (e) => ({
      ...user.state,
      email: e.payload.newEmail,
    }))
    .with({ type: 'UserProfileUpdated' }, (e) => ({
      ...user.state,
      bio: e.payload.bio ?? user.state.profile.bio,
      username: e.payload.username ?? user.state.profile.username,
      image: e.payload.image !== undefined ? e.payload.image : user.state.profile.image,
    }))
    .with({ type: 'UserFollowed' }, (e) => ({
      ...user.state,
      follows: [...user.state.follows, e.payload.followedTo],
    }))
    .with({ type: 'UserUnfollowed' }, (e) => ({
      ...user.state,
      follows: user.state.follows.filter(followedId => followedId !== e.payload.unfollowedFrom)
    }))
    .exhaustive()

  if (!state) return user

  // if event has version it means that event has been loaded from history
  if (event.version) {
    return {
      ...user,
      state,
      version: event.version
    }
  }

  const version = user.version + 1;

  return {
    ...user,
    state,
    version,
    events: [...user.events, { ...event, version }]
  };
}

export const restore = (id: UserId, events: readonly Event[]) => {
  return events.reduce((state, event) => applyEvent(state, event), {} as UserAggregate)
}
