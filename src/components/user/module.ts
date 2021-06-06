import {
  handleRegisterUserCommand,
  handleSendConfirmationEmailCommand,
  handleUpdateUserCommand
} from '@components/user/command/handlers'
import * as Reactions from '@components/user/reactions'
import * as Projections from '@components/user/projections'
import { DomainEvent } from '@lib/common'
import { Context } from '../../composition/ctx'
import { loadEventsToProjection } from '@components/user/queries';

export default (ctx: Context) => {
  const handlers = {
    handleRegisterUserCommand: handleRegisterUserCommand(ctx.services.eventStore, ctx.services.readPersistence('users')),
    handleUpdateUserCommand: handleUpdateUserCommand(ctx.services.eventStore, ctx.services.readPersistence('users')),
    handleSendConfirmationEmailCommand: handleSendConfirmationEmailCommand(ctx.services.eventStore, ctx.services.readPersistence('users')),
  }

  const onEvent = async (event: DomainEvent) => {
    await Projections.onEvent(ctx.services.db)(event)
    await Reactions.onEvent(ctx.bus.createDispatcher(handlers))(event)
  }

  return {
    handlers,
    onEvent,
    queries: {
      loadUserProjection: loadEventsToProjection(ctx.services.eventStore)
    }
  }
}
