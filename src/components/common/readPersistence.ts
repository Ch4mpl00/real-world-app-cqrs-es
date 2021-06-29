import { None, Some } from '@lib/monad'
import { Collection } from 'mongodb'
import { EventStore } from '@components/common/eventStore'
import { DomainEvent } from '@lib/common'

export const createReadModel = <T, CanFindBy extends object> (
  aggregateName: string,
  eventStore: EventStore,
  collection: Collection,
  reducer: (state: T, event: DomainEvent) => T
) => ({
  onEvent: async (event: DomainEvent) => {
    if (event.aggregate !== aggregateName) return

    const aggregate = await collection.findOne<T>({ uuid: event.aggregateId }) || ({} as T)
    const newState = reducer(aggregate, event)
    await collection.updateOne({ id: event.aggregateId }, { $set: newState }, { upsert: true })
    // TODO: deletions
    // TODO: projection versioning
  },

  refresh: async (id: string) => {
    const events = await eventStore.getEvents(aggregateName, id)
    if (events.length == 0) {
      return
    }

    const newState = events.reduce((state, event) => reducer(state, event), {} as T)
    await collection.updateOne({ id }, { $set: newState }, { upsert: true })
    // TODO: deletions
    // TODO: projection versioning
  },

  query: {
    fresh: async (id: string) => {
      const events = await eventStore.getEvents(aggregateName, id)
      if (events.length == 0) {
        return None()
      }

      return Some(
        events.reduce((state, event) => reducer(state, event), {} as T)
      )
    },

    findOneBy: async (findBy: CanFindBy) => {
      const result = await collection.findOne<T>(findBy)
      if (result) {
        return Some(result)
      }

      return None()
    },

    findManyBy: async (findBy: CanFindBy) => {
      return await collection.find<T>(findBy, {}).toArray()
    }
  }
})

