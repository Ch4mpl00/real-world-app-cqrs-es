import { Event, UserFollowed, UserRegistered, UserUnfollowed, UserUpdated } from '@components/user/event'
import { assertUnreachable } from '@lib/common'
import { fail, ok, Result } from '@lib/monad'
import { EmailAlreadyExists } from '@components/user/error'

export type UserId = string

export type RegisterUserData = {
  readonly email: string
  readonly password: string
  readonly username: string
}

export type UpdateUserData = {
  readonly email: string
  readonly bio: string
  readonly image: string | null
}

export type Profile = {
  readonly username: string
  readonly bio: string
  readonly image: string | null
}

export type User = {
  readonly id: string
  readonly email: string
  readonly password: string
  readonly profile: Profile
  readonly follows: ReadonlyArray<UserId>
}

type UserRegistrationContext = {
  readonly emailIsBusy: boolean
  readonly userNameIsBusy: boolean
}

export const registerUser = (
  id: UserId,
  data: RegisterUserData,
  context: UserRegistrationContext
): Result<UserRegistered, EmailAlreadyExists> => {
  if (context.emailIsBusy) {
    return fail({ type: 'EmailAlreadyExists', email: data.email })
  }

  return ok({
    type: 'UserRegistered',
    aggregateId: id,
    payload: data
  })
}

type UpdateUserContext = {
  readonly emailIsBusy: boolean
  readonly userNameIsBusy: boolean
}

export const updateUser = (
  user: User,
  data: UpdateUserData,
  context: UpdateUserContext
): Result<UserUpdated, EmailAlreadyExists> => {
  if (context.emailIsBusy) {
    return fail({ type: 'EmailAlreadyExists', email: data.email })
  }

  return ok({
    type: 'UserUpdated',
    aggregateId: user.id,
    payload: data
  })
}

export const followUser = (user: User, userIdToFollow: UserId): Result<UserFollowed, never> => {
  return ok({
    aggregateId: user.id,
    type: 'UserFollowed',
    payload: {
      followedTo: userIdToFollow
    }
  })
}

export const unfollowUser = (user: User, userIdToUnfollow: UserId): Result<UserUnfollowed, never> => {
  return ok({
    aggregateId: user.id,
    type: 'UserUnfollowed',
    payload: {
      unfollowedFrom: userIdToUnfollow
    }
  })
}

export const apply = (user: User) => (event: Event): User => {
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
    case 'UserUpdated':
      return {
        id: user.id,
        email: event.payload.email || user.email,
        password: user.password,
        follows: user.follows,
        profile: {
          bio: event.payload.bio,
          image: event.payload.image,
          username: user.profile.username
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
