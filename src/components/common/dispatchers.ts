import { RegisterUser, SendConfirmationEmail, UpdateUser } from '@components/user/command/commands'
import { Result } from '@lib/monad';

type Handlers = { readonly [key: string]: (command: any) => any }

export const createCommandDispatcher = (handlers: Handlers) => {
  function handleCommand (command: RegisterUser): Promise<Result<unknown, unknown>>
  function handleCommand (command: UpdateUser): Promise<Result<unknown, unknown>>
  function handleCommand (command: SendConfirmationEmail): Promise<void>

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
