import {
  registerUser,
  sendConfirmationEmail,
  updateUser
} from '@components/user/command/handlers'
import { DomainEvent } from '@lib/common'
import { Context } from '../../composition/ctx'
import { createUserReadModel } from '@components/user/readModel';
import { match } from 'ts-pattern';
import { Event } from '@components/user/domain';
import { createSendConfirmationEmailCommand } from '@components/user/command/commands';

export default (ctx: Context) => {

  const readModel = createUserReadModel(ctx.services.eventStore, ctx.services.db)

  const handlers = {
    registerUser: registerUser(ctx.services.eventStore, readModel),
    updateUser: updateUser(ctx.services.eventStore, readModel),
    sendConfirmationEmail: sendConfirmationEmail(ctx.services.eventStore, readModel),
  }

  type Handlers = typeof handlers;

  const onEvent = (handlers: Handlers) => async (event: DomainEvent) => {
    await readModel.onEvent(event)

    match(event as Event)
      .with({ type: 'UserRegistered' }, async e => {
        await handlers.sendConfirmationEmail(
          createSendConfirmationEmailCommand(e.aggregateId, e.payload.email)
        )
      })
      .with({ type: 'UserEmailChanged' }, async e => {
        await handlers.sendConfirmationEmail(
          createSendConfirmationEmailCommand(e.aggregateId, e.payload.newEmail)
        )
      })
      .run()
  }

  return {
    command: {
      registerUser: registerUser(ctx.services.eventStore, readModel),
      updateUser: updateUser(ctx.services.eventStore, readModel),
      sendConfirmationEmail: sendConfirmationEmail(ctx.services.eventStore, readModel),
    },
    onEvent,
    readModel
  }
}
