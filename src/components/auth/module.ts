import { Context } from '../../composition/ctx';
import { createAuthReadModel } from '@components/auth/readModel';
import { DomainEvent } from '@lib/common';

export default (ctx: Context) => {
  const readModel = createAuthReadModel(ctx.services.eventStore, ctx.services.db)

  const onEvent = async (event: DomainEvent) => {
    await readModel.onEvent(event)
  }

  return {
    onEvent,
    readModel
  }
}
