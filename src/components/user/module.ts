import {
  handleRegisterUserCommand,
  handleSendConfirmationEmailCommand,
  handleUpdateUserCommand
} from '@components/user/command/handlers'
import * as Reactions from '@components/user/reactions'
import { DomainEvent } from '@lib/common'
import { Context } from '../../composition/ctx'
import { createUserReadModel } from '@components/user/readModel';

export default (ctx: Context) => {

  const readModel = createUserReadModel(ctx.services.eventStore, ctx.services.db)

  const handlers = {
    handleRegisterUserCommand: handleRegisterUserCommand(ctx.services.eventStore, readModel),
    handleUpdateUserCommand: handleUpdateUserCommand(ctx.services.eventStore, readModel),
    handleSendConfirmationEmailCommand: handleSendConfirmationEmailCommand(ctx.services.eventStore, readModel),
  }

  const onEvent = async (event: DomainEvent) => {
    await readModel.onEvent(event)
    await Reactions.onEvent(ctx.bus.createDispatcher(handlers))(event)
  }

  return {
    handlers,
    onEvent,
    readModel
  }
}
