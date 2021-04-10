import dotenv from 'dotenv'
import { setupCommandHandlers as setupUserHandlers } from './user'
import { eventStore } from '@components/common/eventStore'
import { Command as UserCommand, RegisterUser, UpdateUser } from '@components/user/command'
import { RegisterUserResult, UpdateUserResult } from '@components/user/commandHandler'
import { assertUnreachable } from '@lib/common'
import { EventStoreDBClient } from '@eventstore/db-client'

dotenv.config()
const mongoConnectionString = `mongodb://${process.env.MONGO_ROOT_USERNAME}:${process.env.MONGO_ROOT_PASSWORD}@${process.env.MONGO_HOST}:${process.env.MONGO_PORT}/${process.env.MONGO_DATABASE}`
console.log(mongoConnectionString)
type Command =
  | UserCommand

export const createApp = (env: 'dev' | 'prod') => {
  const client = new EventStoreDBClient({
    endpoint: '127.0.0.1:2113'
  }, {
    insecure: true
  })

  const _eventStore = eventStore(client)

  const handlers = {
    ...setupUserHandlers(_eventStore)
  }

  function handleCommand (command: RegisterUser): Promise<RegisterUserResult>
  function handleCommand (command: UpdateUser): Promise<UpdateUserResult>

  function handleCommand (command: Command): Promise<any> {
    switch (command.type) {
      case 'RegisterUser':
        return handlers.handleRegisterUserCommand(command)
      case 'UpdateUser':
        return handlers.handleUpdateUserCommand(command)
      default:
        assertUnreachable(command)
    }
  }

  return {
    handleCommand
  }
}

export type App = ReturnType<typeof createApp>
