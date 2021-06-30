import { createReadModel } from '@components/common/readPersistence'
import { EventStore } from '@components/common/eventStore'
import { Db } from 'mongodb'
import { DomainEvent, ReturnTypeRecursive } from '@lib/common'
import { match } from 'ts-pattern'
import { Event } from '@components/user/domain'
import { None, Some } from '@lib/monad';
import { comparePassword } from '@lib/crypto';
import jwt from 'jsonwebtoken';

type AuthProjection = {
  readonly userId: string,
  readonly email: string,
  readonly password: string,
}

export const createAuthReadModel = (eventStore: EventStore, db: Db) => {
  const collection = db.collection('auth')
  type FilterByFields = { id?: string, email?: string }
  const model = createReadModel<AuthProjection, FilterByFields>(
    'user',
    eventStore,
    collection,
    applyEventsOnAuth
  )

  return {
    ...model,
    query: {
      ...model.query,
      getAuthTokenByCredentials: async (email: string, password: string) => {
        const user = await model.query.findOneBy({ email })
        if (user.isNone) {
          return None()
        }

        return (await comparePassword(password, user.some.password))
          ? Some(jwt.sign({ userId: user.some.userId, email: user.some.email }, 'secret')) // TODO: get secret as arg
          : None()
      }
    }
  }
}

export type AuthReadModel = ReturnTypeRecursive<typeof createAuthReadModel>

const applyEventsOnAuth = (state: AuthProjection, event: DomainEvent) => {
  return match(event as Event)
    .with({ type: "UserRegistered" }, (event): AuthProjection => ({
      email: event.payload.email,
      password: event.payload.password,
      userId: event.aggregateId,
    }))
    .with({ type: "UserEmailChanged" }, (event): AuthProjection => ({
      ...state,
      email: event.payload.newEmail,
    }))
    .run()
}
