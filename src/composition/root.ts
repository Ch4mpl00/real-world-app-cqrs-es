import dotenv from 'dotenv'
import { buildContext } from './ctx'
import UserModule from '@components/user/module'
import AuthModule from '@components/auth/module'

dotenv.config()

export const createApp = async (env: 'dev' | 'prod') => {
  const context = await buildContext(env)
  const userModule = await UserModule(context)
  const authModule = await AuthModule(context)

  const listeners = [
    userModule.onEvent(userModule.command),
    authModule.onEvent,
  ]

  context.services.emitter.on('*', (eventType, event) => {
    listeners.map(reactOnEvent => {
      reactOnEvent(event)
    })
  })

  return {
    user: {
      query: userModule.readModel.query,
      command: userModule.command,
    },
    auth: {
      query: authModule.readModel.query
    }
  }
}

type ThenArgRecursive<T> = T extends PromiseLike<infer U> ? ThenArgRecursive<U> : T
export type App = ThenArgRecursive<ReturnType<typeof createApp>>
