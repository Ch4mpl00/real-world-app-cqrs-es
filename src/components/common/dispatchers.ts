import { RegisterUser, SendConfirmationEmail, UpdateUser } from '@components/user/command/commands'
import {
  handleRegisterUserCommand, handleSendConfirmationEmailCommand,
  handleUpdateUserCommand
} from '@components/user/command/handlers';
import { ReturnTypeRecursive } from '@lib/common';

type Handlers = { readonly [key: string]: (command: any) => any }

export const createCommandDispatcher = (handlers: Handlers) => {
  function handleCommand (command: RegisterUser): ReturnTypeRecursive<typeof handleRegisterUserCommand>
  function handleCommand (command: UpdateUser): ReturnTypeRecursive<typeof handleUpdateUserCommand>
  function handleCommand (command: SendConfirmationEmail): ReturnTypeRecursive<typeof handleSendConfirmationEmailCommand>

  function handleCommand (command: any): any {
    const key = `handle${command.type}Command`
    if (key in handlers) {
      return handlers[key](command)
    } else {
      // eslint-disable-next-line functional/no-throw-statement
      throw new Error(`Unexpected command ${command.type}`)
    }
  }

  return handleCommand
}

export type DispatchCommand = ReturnType<typeof createCommandDispatcher>
