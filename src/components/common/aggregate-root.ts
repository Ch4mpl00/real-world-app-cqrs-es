import { Event } from '@components/common/events';

export type AggregateRoot = {
  readonly id: string
  readonly type: string
  readonly version: number
  readonly events: Event[]
  readonly state: Record<string, any>
}
