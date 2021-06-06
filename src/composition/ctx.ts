import { eventStore } from '@components/common/eventStore';
import { MongoClient } from 'mongodb';
import mitt from 'mitt';
import { persistence } from '@components/common/readPersistence';
import { createCommandDispatcher } from '@components/common/dispatchers';
import dotenv from 'dotenv'

dotenv.config()

const mongoConnectionString = `mongodb://${process.env.MONGO_ROOT_USERNAME}:${process.env.MONGO_ROOT_PASSWORD}@${process.env.MONGO_HOST}:${process.env.MONGO_PORT}/`

const registerServices = async () => {
  const emitter = mitt()
  const mongoClient = new MongoClient(mongoConnectionString);
  const db = (await mongoClient.connect()).db(process.env.MONGO_DATABASE);
  const _eventStore = eventStore(db, emitter)

  return {
    eventStore: _eventStore,
    emitter: emitter,
    readPersistence: persistence(db),
    db: db,
  }
}

export const buildContext = async (env: 'dev' | 'prod') => {
  const services = await registerServices()
  return {
    services,
    bus: {
      createDispatcher: createCommandDispatcher,
    }
  }
}

type ThenArgRecursive<T> = T extends PromiseLike<infer U> ? ThenArgRecursive<U> : T
export type Context = ThenArgRecursive<ReturnType<typeof buildContext>>
