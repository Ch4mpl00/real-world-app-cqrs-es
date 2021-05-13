import dotenv from 'dotenv'
import { setupCommandHandlers as setupUserHandlers, setUpPersistence } from './user'
import { eventStore } from '@components/common/eventStore'
import { createCommandDispatcher } from '@components/common/dispatchers'
import { onEvent } from '@components/user/projections'
import { MongoClient } from 'mongodb'
import mitt from 'mitt';

dotenv.config()
const mongoConnectionString = `mongodb://${process.env.MONGO_ROOT_USERNAME}:${process.env.MONGO_ROOT_PASSWORD}@${process.env.MONGO_HOST}:${process.env.MONGO_PORT}/`

console.log(mongoConnectionString)

export const createApp = async (env: 'dev' | 'prod') => {

  // Create a new MongoClient
  const mongoClient = new MongoClient(mongoConnectionString);
  const db = (await mongoClient.connect()).db(process.env.MONGO_DATABASE);

  const emitter = mitt()

  emitter.on('user', (e) => {
    onEvent(db, emitter)(e)
  })

  const _eventStore = eventStore(db, emitter)

  const query = {
    user: setUpPersistence(db)
  }

  const handlers = {
    ...setupUserHandlers(_eventStore, query.user)
  }

  return {
    handleCommand: createCommandDispatcher(handlers),
    query,
    on: emitter.on
  }
}

type ThenArgRecursive<T> = T extends PromiseLike<infer U> ? ThenArgRecursive<U> : T
export type App = ThenArgRecursive<ReturnType<typeof createApp>>
