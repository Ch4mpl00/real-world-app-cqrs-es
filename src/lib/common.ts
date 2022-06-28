import Joi, { Schema } from 'joi';

export const assert = (value: any, schema: Schema) => {
  Joi.assert(value, schema);
};

export type DomainEvent = {
  type: string,
  aggregate: string,
  aggregateId: string,
  payload: any
}

type AnyFunc = (...args: any) => any;
export type ReturnTypeRecursive<T extends AnyFunc> = T extends AnyFunc ? ReturnTypeRecursive<ReturnType<T>> : T;

export function ensure<T>(argument: T | undefined | null, message: string): T {
  if (argument === undefined || argument === null) {
    throw new TypeError(message);
  }

  return argument;
}
