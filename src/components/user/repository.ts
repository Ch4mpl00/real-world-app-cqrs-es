import { Event, UserAggregate } from '@components/user/domain';
import { ok, Result } from '@lib/monad';
import { v4 } from 'uuid';

export type IUserRepository = {
  readonly get: (id: string) => Promise<UserAggregate | null>
  readonly getEvents: (id: string) => Promise<Event[]>
  readonly save: (user: UserAggregate) => Promise<Result<true, Error>>
}

export const createUserRepository = (): IUserRepository => ({
  get: async () => ({ id: v4(), type: 'user', state: {}, version: 1 } as UserAggregate),
  getEvents: async () => [],
  save: async (user: UserAggregate) => {
    console.log('save', JSON.stringify(user));
    return ok(true)
  }
})
