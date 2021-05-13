import { EventStore } from '@components/common/eventStore'
import { ReadPersistence } from '@components/common/readPersistence'
import { UserProjection } from '@components/user/projections'
import {
  RegisterUser,
  UpdateUser,
  registerUserDataSchema,
  sendEmailConfirmationSchema,
  updateUserDataSchema
} from '@components/user/command/commands'
import { assert } from '@lib/common'
// import { hash } from '@lib/crypto'
import { Event, registerUser, restore, updateUser, User, UserId } from '@components/user/domain'
import { fail, ok } from '@lib/monad'

/*
* ===========================
* Handle RegisterUser command
* ===========================
* */
export const handleRegisterUserCommand = (
  eventStore: EventStore,
  persistence: ReadPersistence<UserProjection>
) => async (command: RegisterUser) => {
  assert(command.data, registerUserDataSchema)

  const data = {
    ...command.data,
    // password: await hash(command.data.password)
  }

  const result = registerUser(command.data.id, data, {
    emailIsBusy: await persistence.exists({ email: data.email })
  })

  // console.log(await persistence.findOneBy({ email: data.email }))
  if (result.ok) {
    await eventStore.commitEvent('user', result.value)
  } else {
    // console.log(result.error)
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
  persistence: ReadPersistence<UserProjection>
) => async (command: UpdateUser) => {
  assert(command.data, updateUserDataSchema)

  const user = await restoreUserState(eventStore, command.data.id)

  const result = updateUser(user, command.data, {
    emailIsBusy: await persistence.exists({ email: command.data.email })
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
  persistence: ReadPersistence<UserProjection>
) => async (command: RegisterUser): Promise<void> => {
  assert(command.data, sendEmailConfirmationSchema)
  // create confirmation token
  // send an email
}
