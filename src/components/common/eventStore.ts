import { Db } from 'mongodb';
import { Emitter } from 'mitt';
import { AggregateRoot } from '@components/common/aggregate-root';
import { Event } from '@components/common/events';

export type GetEvents = <T extends Event>(aggregateName: string, id: string) => Promise<ReadonlyArray<T>>
export type CommitEvent = <T>(aggregate: AggregateRoot) => Promise<void>

export type EventStore = {
  readonly getEvents: GetEvents
  readonly commit: CommitEvent
}

export const eventStore = (db: Db, emitter: Emitter): EventStore => ({
  commit: async <T> (aggregate: AggregateRoot) => {
    // await db.collection('_events').insertOne({ ...event, stream: stream, timestamp: new Date().getTime() })
    // emitter.emit(event.type, event)
  },
  getEvents: async <T extends Event> (aggregateName: string, id: string) => {
    return Promise.resolve([])
    // return await db.collection('_events').find({ aggregateName, aggregateId: id }).toArray()
  },
})
