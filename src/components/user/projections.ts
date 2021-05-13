import { User } from '@components/user/domain'
import { Event } from '@components/user/domain'
import { Db } from 'mongodb'
import { Emitter } from 'mitt';
import { DomainEvent } from '@lib/common';
import { match } from 'ts-pattern';
import assert from 'assert';

export type UserProjection = User & {
  readonly createdAt: number
  readonly updatedAt: number
}

export enum UserProjectionEvent {
  DomainUserProjectionSaved = 'DomainUserProjectionSaved'
}

export const onEvent = (persistence: Db, emitter: Emitter) => async (event: DomainEvent) => {
  if (event.aggregate !== 'user') return

  await createUserProjection(persistence)(event as Event)
}

const createUserProjection = (persistence: Db) => async (event: Event): Promise<void> => {
  const user: UserProjection | null = (await persistence.collection('users').findOne({ id: event.aggregateId }))
  const projection = applyOnUserProjection(user, event)
  await persistence.collection('users').updateOne({ id: projection.id }, { $set: projection }, { upsert: true })
}

const applyOnUserProjection = (user: UserProjection | null, event: Event) => {
  if (user === null && event.type === 'UserRegistered') {
    return {
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
    }
  }
  assert(user !== null)

  return match(event)
    .with({ type: 'UserRegistered' }, (): UserProjection => user)
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
