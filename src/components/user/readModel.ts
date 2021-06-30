import { User } from '@components/user/domain'
import { Event } from '@components/user/domain'
import { Db } from 'mongodb'
import { DomainEvent, ReturnTypeRecursive } from '@lib/common';
import { match } from 'ts-pattern';
import { createReadModel } from '@components/common/readPersistence';
import { EventStore } from '@components/common/eventStore';

export type UserProjection = User & {
  readonly createdAt: number
  readonly updatedAt: number
}

export const createUserReadModel = (eventStore: EventStore, db: Db) => {
  type FilterByFields = { id?: string, email?: string }
  const model = createReadModel<UserProjection, FilterByFields>(
    'user',
    eventStore,
    db.collection('user'),
    applyEventsOnUserProjection
  )

  return {
    ...model,
    query: {
      ...model.query,
      // your custom queries here
    }
  }
}

export type UserReadModel = ReturnTypeRecursive<typeof createUserReadModel>

export const applyEventsOnUserProjection = (user: UserProjection, event: DomainEvent) => {
  return match(event as Event)
    .with({ type: 'UserRegistered' }, (event): UserProjection => ({
      id: event.aggregateId,
      email: event.payload.email,
      password: event.payload.password,
      follows: [],
      profile: {
        bio: '',
        image: null,
        username: event.payload.username
      },
      createdAt: new Date().getTime(),
      updatedAt: new Date().getTime()
    }))
    .with({ type: 'UserEmailChanged' }, (event) => ({
      ...user,
      email: event.payload.newEmail,
      updatedAt: new Date().getTime()
    }))
    .with({ type: 'UserProfileUpdated' }, (event) => ({
      ...user,
      updatedAt: new Date().getTime(),
      profile: {
        bio: event.payload.bio ?? user.profile.bio,
        username: event.payload.username ?? user.profile.username,
        image: event.payload.image !== undefined ? event.payload.image : user.profile.image,
      }
    }))
    .with({ type: 'UserFollowed' }, (event) => ({
      ...user,
      updatedAt: new Date().getTime(),
      follows: [...user.follows, event.payload.followedTo]
    }))
    .with({ type: 'UserUnfollowed' }, (event) => ({
      ...user,
      updatedAt: new Date().getTime(),
      follows: user.follows.filter(followedId => followedId !== event.payload.unfollowedFrom)
    }))
    .exhaustive()
}
