import { RegisterUserData, UpdateUserData, UserId } from '@components/user/domain'

export type UserRegistered = {
  readonly type: 'UserRegistered'
  readonly aggregateId: UserId,
  readonly payload: RegisterUserData
}

export type UserProfileUpdated = {
  readonly type: 'UserProfileUpdated'
  readonly aggregateId: UserId,
  readonly payload: UpdateUserData
}

export type UserEmailChanged = {
  readonly type: 'UserEmailChanged'
  readonly aggregateId: UserId
  readonly payload: {
    readonly newEmail: string
    readonly oldEmail: string
  }
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
  | UserEmailChanged
  | UserProfileUpdated
  | UserFollowed
  | UserUnfollowed

export const createUserRegisteredEvent = (id: UserId, data: RegisterUserData): UserRegistered => ({
  type: 'UserRegistered',
  aggregateId: id,
  payload: data
})

export const createUserProfileUpdatedEvent = (id: UserId, data: UpdateUserData): UserProfileUpdated => ({
  type: 'UserProfileUpdated',
  aggregateId: id,
  payload: data
})

export const createUserEmailChangedEvent = (id: string, newEmail: string, oldEmail: string): UserEmailChanged => ({
  type: 'UserEmailChanged',
  aggregateId: id,
  payload: { newEmail, oldEmail }
})
