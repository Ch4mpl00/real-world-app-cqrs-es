import { EventStoreDBClient, jsonEvent } from '@eventstore/db-client'

type Event = {
  readonly aggregateId: string
  readonly type: string
  readonly payload: any
}

type Stream =
  | 'user'
  | 'article'

export type GetEvents = (id: string) => Promise<ReadonlyArray<Event>>
export type CommitEvent = <T extends Event>(stream: Stream, event: T) => Promise<T>

export type EventStore = {
  readonly getEvents: GetEvents
  readonly commitEvent: CommitEvent
}

export const eventStore = (client: EventStoreDBClient): EventStore => ({
  commitEvent: async <T extends Event> (stream: Stream, event: T) => {
    console.log('start event', event, 'end event')
    await client.appendToStream(`${stream}-${event.aggregateId}`, jsonEvent({
      type: event.type,
      data: { ...event.payload, aggregateId: event.aggregateId }
    }))

    return event
  },
  getEvents: async (id: string) => {
    return []
  }
})
