import { match } from 'ts-pattern'
import { DispatchCommand } from '@components/common/dispatchers'
import { createSendConfirmationEmailCommand } from '@components/user/command/commands'
import { DomainEvent } from '@lib/common';
import { Event } from '@components/user/domain';

export const onEvent = (dispatch: DispatchCommand) => (event: DomainEvent) => {
  match(event as Event)
    .with({ type: 'UserRegistered' }, async e => {
      await dispatch(createSendConfirmationEmailCommand(e.aggregateId, e.payload.email))
    })
    .with({ type: 'UserEmailChanged' }, async e => {
      await dispatch(createSendConfirmationEmailCommand(e.aggregateId, e.payload.newEmail))
    })
    .with({ type: 'UserEmailChanged' }, async e => {
      await dispatch(createSendConfirmationEmailCommand(e.aggregateId, e.payload.newEmail))
    })
    .run()
}
