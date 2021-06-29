import { assertUnreachable } from '@lib/common'
import { fail, ok, Result } from '@lib/monad'
import { createEmailAlreadyExistsError, EmailAlreadyExists } from '@components/user/domain'
import {
  createUserEmailChangedEvent,
  createUserProfileUpdatedEvent,
  Event,
  UserEmailChanged,
  UserFollowed,
  UserRegistered,
  UserUnfollowed,
  UserProfileUpdated,
  UserId,
  RegisterUserData,
  User,
  UpdateUserData
} from '@components/user/domain'

type UserRegistrationContext = {
  readonly emailAlreadyExists: boolean
}

export const registerUser = (
  id: UserId,
  data: RegisterUserData,
  context: UserRegistrationContext
): Result<UserRegistered, EmailAlreadyExists> => {
  if (context.emailAlreadyExists) {
    return fail({ type: 'EmailAlreadyExists', email: data.email })
  }

  return ok({
    aggregate: 'user',
    type: 'UserRegistered',
    aggregateId: id,
    payload: data
  })
}

type UpdateUserContext = {
  readonly emailIsBusy: boolean
}

type UpdateUserEvents =
  | UserProfileUpdated
  | UserEmailChanged

export const updateUser = (
  user: User,
  data: UpdateUserData,
  context: UpdateUserContext
): Result<ReadonlyArray<UpdateUserEvents>, EmailAlreadyExists> => {
  const events = []

  if (data.email !== undefined) {
    if (context.emailIsBusy) return fail(createEmailAlreadyExistsError(data.email))
    if (data.email !== user.email) events.push(createUserEmailChangedEvent(user.id, data.email, user.email))
  }

  events.push(createUserProfileUpdatedEvent(user.id, data))

  return ok(events)
}

export const followUser = (user: User, userIdToFollow: UserId): Result<UserFollowed, never> => {
  return ok({
    aggregateId: user.id,
    aggregate: 'user',
    type: 'UserFollowed',
    payload: {
      followedTo: userIdToFollow
    }
  })
}

export const unfollowUser = (user: User, userIdToUnfollow: UserId): Result<UserUnfollowed, never> => {
  return ok({
    aggregateId: user.id,
    aggregate: 'user',
    type: 'UserUnfollowed',
    payload: {
      unfollowedFrom: userIdToUnfollow
    }
  })
}

// TODO: initial state
export const apply = (user: User) => (event: Event): User => {
  if (event.aggregateId !== user.id) {
    return user
  }
  switch (event.type) {
    case 'UserRegistered':
      return {
        id: event.aggregateId,
        email: event.payload.email,
        password: event.payload.password,
        follows: [],
        profile: {
          bio: '',
          image: null,
          username: event.payload.username
        }
      }
    case 'UserEmailChanged':
      return {
        ...user,
        email: event.payload.newEmail
        // TODO: set emailConfirmed property to false
      }
    case 'UserProfileUpdated':
      return {
        ...user,
        profile: {
          bio: event.payload.bio ?? user.profile.bio,
          username: event.payload.username ?? user.profile.username,
          image: event.payload.image !== undefined ? event.payload.image : user.profile.image,
        }
      }
    case 'UserFollowed':
      return {
        ...user,
        follows: [...user.follows, event.payload.followedTo]
      }
    case 'UserUnfollowed':
      return {
        ...user,
        follows: user.follows.filter(followedId => followedId !== event.payload.unfollowedFrom)
      }
    default:
      assertUnreachable(event)
  }
}

export const restore = (id: UserId, events: readonly Event[]) => {
  return events.reduce((state, event) => apply(state)(event), {} as User)
}
