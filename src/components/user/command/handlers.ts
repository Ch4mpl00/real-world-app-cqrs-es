import { EventStore } from '@components/common/eventStore'
import {
  RegisterUser,
  UpdateUser,
  registerUserDataSchema,
  sendEmailConfirmationSchema,
  updateUserDataSchema
} from '@components/user/command/commands'
import { assert } from '@lib/common'
import { hash } from '@lib/crypto'
import { Event, registerUser, restore, updateUser, User, UserId } from '@components/user/domain'
import { fail, ok } from '@lib/monad'
import { UserReadModel } from '@components/user/readModel';

/*
* ===========================
* Handle RegisterUser command
* ===========================
* */
export const handleRegisterUserCommand = (
  eventStore: EventStore,
  userReadModel: UserReadModel
) => async (command: RegisterUser) => {
  assert(command.data, registerUserDataSchema)

  const data = {
    ...command.data,
    password: await hash(command.data.password)
  }

  const result = registerUser(command.data.id, data, {
    emailAlreadyExists: (await userReadModel.query.findOneBy({ email: data.email })).isSome
  })

  if (result.ok) {
    await eventStore.commitEvent('user', result.value)
  }

  return result
}

/*
* =========================
* Handle UpdateUser command
* =========================
* */
export const handleUpdateUserCommand = (
  eventStore: EventStore,
  userReadModel: UserReadModel
) => async (command: UpdateUser) => {
  assert(command.data, updateUserDataSchema)

  const user = await restoreUserState(eventStore, command.data.id)

  const result = updateUser(user, command.data, {
    emailIsBusy: (await userReadModel.query.findOneBy({ email: command.data.email })).isSome
  })

  if (result.ok) {
    result.value.forEach(event => {
      eventStore.commitEvent('user', event)
    })

    return ok(result.value)
  }

  return fail(result.error)
}

const restoreUserState = async (eventStore: EventStore, id: UserId): Promise<User> => {
  return await eventStore.getEvents<Event>('user', id).then(e => restore(id, e))
}

/*
* ====================================
* Handle SendConfirmationEmail command
* ====================================
* */
export const handleSendConfirmationEmailCommand = (
  eventStore: EventStore,
  userReadModel: UserReadModel
) => async (command: RegisterUser): Promise<void> => {
  assert(command.data, sendEmailConfirmationSchema)
  console.log(`Sent confirmation email to ${command.data.email}`)
  // create confirmation token
  // send an email
}
