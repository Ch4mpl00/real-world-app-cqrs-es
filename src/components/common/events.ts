export type Event = {
  readonly type: string
  readonly version?: number
  readonly payload: Record<string, any>
}
