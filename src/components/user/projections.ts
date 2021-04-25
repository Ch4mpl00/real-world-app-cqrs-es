import { apply, User, UserId } from '@components/user/domain'
import { Event } from '@components/user/domain'
// import { EventStore } from '@components/common/eventStore'
import { Db } from 'mongodb'
import { Emitter } from 'mitt';

export type UserDomainProjection = User & {
  readonly timestamp?: number
}

export type ReceivedEvent = Event & {
  readonly timestamp: number
}

export enum UserProjectionEvent {
  DomainUserProjectionSaved = 'DomainUserProjectionSaved'
}

export const onEvent = (persistence: Db, emitter: Emitter) => async (event: ReceivedEvent): Promise<void> => {
  const user: UserDomainProjection = (await persistence.collection('users').findOne({ id: event.aggregateId })) || { id: event.aggregateId }
  await saveProjection(persistence, emitter)(
    user.id,
    projectDomainUser(user, [event])
  )
}

const saveProjection = (persistence: Db, emitter: Emitter) => async (id: UserId, projectionState: UserDomainProjection) => {
  await persistence.collection('users').updateOne({ id }, { $set: projectionState }, { upsert: true })
  emitter.emit('DomainUserProjectionSaved', id)
}

const projectDomainUser = (user: User, events: ReceivedEvent[]): UserDomainProjection => {
  const applyOnUser = apply(user)
  const state = events.reduce((state, event) => applyOnUser(event), user)

  return { ...state, timestamp: events[events.length - 1].timestamp }
}
