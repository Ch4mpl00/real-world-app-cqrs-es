import dotenv from 'dotenv'
import { buildContext } from './ctx'
import UserModule from '@components/user/module'

dotenv.config()

export const createApp = async (env: 'dev' | 'prod') => {
  const context = await buildContext(env)
  const userModule = await UserModule(context)

  const handlers = {
    ...userModule.handlers
  }

  const listeners = [
    userModule.onEvent
  ]

  context.services.emitter.on('*', (eventType, event) => {
    listeners.map(reactOnEvent => {
      reactOnEvent(event)
    })
  })

  return {
    handleCommand: context.bus.createDispatcher(handlers),
    user: {
      query: userModule.readModel.query
    }
  }
}

type ThenArgRecursive<T> = T extends PromiseLike<infer U> ? ThenArgRecursive<U> : T
export type App = ThenArgRecursive<ReturnType<typeof createApp>>
