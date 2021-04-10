import { RegisterUserData, UpdateUserData, UserId } from '@components/user/domain'

export type UserRegistered = {
  readonly type: 'UserRegistered'
  readonly aggregateId: UserId,
  readonly payload: RegisterUserData
}

export type UserUpdated = {
  readonly type: 'UserUpdated'
  readonly aggregateId: UserId,
  readonly payload: UpdateUserData
}

export type UserFollowed = {
  readonly type: 'UserFollowed'
  readonly aggregateId: UserId,
  readonly payload: {
    readonly followedTo: UserId
  }
}

export type UserUnfollowed = {
  readonly type: 'UserUnfollowed'
  readonly aggregateId: UserId,
  readonly payload: {
    readonly unfollowedFrom: UserId
  }
}

export type Event =
  | UserRegistered
  | UserUpdated
  | UserFollowed
  | UserUnfollowed
