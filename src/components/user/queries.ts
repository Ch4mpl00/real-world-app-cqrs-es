import { EventStore } from '@components/common/eventStore'
import { Event, UserId } from '@components/user/domain'
import { None, Option, Some } from '@lib/monad';

export const loadEventsToProjection = (eventStore: EventStore) => (id: UserId) => async <T> (apply: (projection: T, e: Event) => T): Promise<Option<T>> => {
  const events = await eventStore.getEvents<Event>('user', id)

  if (events.length === 0) return None()

  const state = events.reduce((state, event) => apply(state, event), {} as T)

  return Some(state)
}
