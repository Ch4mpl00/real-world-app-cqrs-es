import { Db } from 'mongodb';
import { Emitter } from 'mitt';

type Event = {
  readonly aggregateId: string
  readonly aggregate: string
  readonly type: string
  readonly payload: any
  readonly timestamp?: number
}

type Stream =
  | 'user'
  | 'article'
  | string

export type GetEvents = <T extends Event>(stream: Stream, id: string, fromTimestamp?: number) => Promise<ReadonlyArray<T>>
export type CommitEvent = <T extends Event>(stream: Stream, event: T) => Promise<void>

export type EventStore = {
  readonly getEvents: GetEvents
  readonly commitEvent: CommitEvent
}

export const eventStore = (db: Db, emitter: Emitter): EventStore => ({
  commitEvent: async <T extends Event> (stream: Stream, event: T) => {
    await db.collection('_events').insertOne({ ...event, stream: stream, timestamp: new Date().getTime() })
    emitter.emit(event.type, event)
  },
  getEvents: async <T extends Event>(stream: string, id: string, fromTimestamp: number | null | undefined = null) => {
    return await db.collection('_events').find({ stream, aggregateId: id }).toArray()
  },
})
