import { EventStore } from '@components/common/eventStore'
import { Event, UserId } from '@components/user/domain'

export const loadEventsToProjection = (eventStore: EventStore) => (id: UserId) => async <T> (apply: (projection: T, e: Event) => T) => {
  console.log((await eventStore.getEvents<Event>('user', id)))

  return (await eventStore.getEvents<Event>('user', id))
    .reduce((state, event) => apply(state, event), {} as T)
}
