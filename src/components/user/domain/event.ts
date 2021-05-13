import { RegisterUserData, UpdateUserData, UserId } from '@components/user/domain'

export type UserRegistered = {
  readonly type: 'UserRegistered'
  readonly aggregate: 'user'
  readonly aggregateId: UserId,
  readonly payload: RegisterUserData
}

export type UserProfileUpdated = {
  readonly type: 'UserProfileUpdated'
  readonly aggregate: 'user'
  readonly aggregateId: UserId,
  readonly payload: UpdateUserData
}

export type UserEmailChanged = {
  readonly type: 'UserEmailChanged'
  readonly aggregate: 'user'
  readonly aggregateId: UserId
  readonly payload: {
    readonly newEmail: string
    readonly oldEmail: string
  }
}

export type UserFollowed = {
  readonly type: 'UserFollowed'
  readonly aggregate: 'user'
  readonly aggregateId: UserId,
  readonly payload: {
    readonly followedTo: UserId
  }
}

export type UserUnfollowed = {
  readonly type: 'UserUnfollowed'
  readonly aggregate: 'user'
  readonly aggregateId: UserId,
  readonly payload: {
    readonly unfollowedFrom: UserId
  }
}

export type Event =
  | UserRegistered
  | UserEmailChanged
  | UserProfileUpdated
  | UserFollowed
  | UserUnfollowed

export const createUserRegisteredEvent = (id: UserId, data: RegisterUserData): UserRegistered => ({
  type: 'UserRegistered',
  aggregate: 'user',
  aggregateId: id,
  payload: data
})

export const createUserProfileUpdatedEvent = (id: UserId, data: UpdateUserData): UserProfileUpdated => ({
  type: 'UserProfileUpdated',
  aggregate: 'user',
  aggregateId: id,
  payload: data
})

export const createUserEmailChangedEvent = (id: string, newEmail: string, oldEmail: string): UserEmailChanged => ({
  type: 'UserEmailChanged',
  aggregate: 'user',
  aggregateId: id,
  payload: { newEmail, oldEmail }
})
