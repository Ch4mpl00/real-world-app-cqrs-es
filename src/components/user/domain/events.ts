import { RegisterUserData, UpdateUserData, UserId } from 'src/components/user/domain';

export type UserRegistered = {
  readonly type: 'UserRegistered'
  readonly version?: number
  readonly timestamp: number
  readonly aggregate: 'user'
  readonly aggregateId: UserId,
  readonly payload: RegisterUserData
}

export type UserProfileUpdated = {
  readonly type: 'UserProfileUpdated'
  readonly version?: number
  readonly timestamp: number
  readonly aggregate: 'user'
  readonly aggregateId: UserId,
  readonly payload: UpdateUserData
}

export type UserEmailChanged = {
  readonly type: 'UserEmailChanged'
  readonly version?: number
  readonly timestamp: number
  readonly aggregate: 'user'
  readonly aggregateId: UserId
  readonly payload: {
    readonly newEmail: string
    readonly oldEmail: string
  }
}

export type UserFollowed = {
  readonly type: 'UserFollowed'
  readonly version?: number
  readonly timestamp: number
  readonly aggregate: 'user'
  readonly aggregateId: UserId,
  readonly payload: {
    readonly followeeId: UserId
  }
}

export type UserUnfollowed = {
  readonly type: 'UserUnfollowed'
  readonly version?: number
  readonly timestamp: number
  readonly aggregate: 'user'
  readonly aggregateId: UserId,
  readonly payload: {
    readonly followeeId: UserId
  }
}

export type UserDomainEvent =
  | UserRegistered
  | UserEmailChanged
  | UserProfileUpdated
  | UserFollowed
  | UserUnfollowed

export const createUserRegisteredEvent = (id: UserId, data: RegisterUserData, timestamp: number): UserRegistered => ({
  type: 'UserRegistered',
  aggregate: 'user',
  aggregateId: id,
  payload: data,
  timestamp
});

export const createUserProfileUpdatedEvent = (id: UserId, data: UpdateUserData, timestamp: number): UserProfileUpdated => ({
  type: 'UserProfileUpdated',
  aggregate: 'user',
  aggregateId: id,
  payload: data,
  timestamp
});

export const createUserEmailChangedEvent = (id: string, newEmail: string, oldEmail: string, timestamp: number): UserEmailChanged => ({
  type: 'UserEmailChanged',
  aggregate: 'user',
  aggregateId: id,
  payload: { newEmail, oldEmail },
  timestamp
});

export const createUserFollowedEvent = (id: string, followeeId: string, timestamp: number): UserFollowed => ({
  type: 'UserFollowed',
  aggregate: 'user',
  aggregateId: id,
  payload: { followeeId },
  timestamp
});

export const createUserUnfollowedEvent = (id: string, followeeId: string, timestamp: number): UserUnfollowed => ({
  type: 'UserUnfollowed',
  aggregate: 'user',
  aggregateId: id,
  payload: { followeeId },
  timestamp
});
