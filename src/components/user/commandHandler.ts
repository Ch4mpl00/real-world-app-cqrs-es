import { fail, ok, Result } from '@lib/monad'
import { UserRegistered, UserUpdated } from '@components/user/event'
import { RegisterUser, UpdateUser } from '@components/user/command'
import { registerUser } from '@components/user/domain'
import { v4 as uuid } from 'uuid'
import { EventStore } from '@components/common/eventStore'
import { EmailAlreadyExists } from '@components/user/error'
import { registerUserDataSchema } from '@components/user/validation'
import { assert } from '@lib/common'
import { hash } from '@lib/crypto'

export type RegisterUserResult = Result<UserRegistered, EmailAlreadyExists>
export type UpdateUserResult = Result<UserUpdated, any>

export const handleRegisterUserCommand = (
  eventStore: EventStore
) => async (command: RegisterUser): Promise<RegisterUserResult> => {
  assert(command.data, registerUserDataSchema)

  const data = {
    ...command.data,
    password: await hash(command.data.password)
  }

  // TODO: call query model to check does email exist?
  const result = registerUser(uuid(), data, {
    emailIsBusy: false,
    userNameIsBusy: false
  })

  if (result.isSuccess) {
    return ok(await eventStore.commitEvent('user', result.value))
  }

  return fail(result.error)
}

export const handleUpdateUserCommand = (
  eventStore: EventStore
) => async (command: UpdateUser): Promise<UpdateUserResult> => {
  // eslint-disable-next-line functional/no-throw-statement
  throw new Error('not implemented')
}
