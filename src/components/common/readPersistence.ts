import { None, Option, Some } from '@lib/monad'
import { Db, FilterQuery } from 'mongodb';

export type ReadPersistence<T> = {
  readonly findOne: (id: string) => Promise<Option<T>>
  readonly findOneBy: <Y extends {}>(findBy: Y) => Promise<Option<T>>
  readonly exists: <Y extends {}>(findBy: Y) => Promise<boolean>
  // readonly find: <Y extends {}>(findBy: Y) => Promise<ReadonlyArray<T>>
}

export const persistence =  (db: Db) => <T>(collection: string): ReadPersistence<T> => {
  const findOneBy = async (findBy: FilterQuery<any>) => {
    const result = await db.collection(collection).findOne(findBy) as unknown as T
    if (result) {
      return Some(result)
    }

    return None()
  }

  const findOne = async (id: string) => findOneBy({ id })
  const exists = async (findBy: FilterQuery<any>) => {
    return (await findOneBy(findBy)).isSome
  }

  return {
    findOne,
    findOneBy,
    exists
  }
}
