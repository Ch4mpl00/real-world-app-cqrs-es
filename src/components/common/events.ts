export type Event = {
  readonly aggregateId: string;
  readonly type: string
  readonly version?: number
  readonly payload: Record<string, any>
  readonly aggregate: string
}
