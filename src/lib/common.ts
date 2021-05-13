import Joi, { Schema } from 'joi'

export function assertUnreachable (_: never): never {
  // eslint-disable-next-line functional/no-throw-statement
  throw new Error("Didn't expect to get here")
}

export const assert = (value: any, schema: Schema) => {
  Joi.assert(value, schema)
}

export type DomainEvent = {
  type: string,
  aggregate: string,
  aggregateId: string,
  payload: any
}
