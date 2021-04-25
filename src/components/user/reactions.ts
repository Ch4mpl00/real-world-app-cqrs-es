import { Event } from '@components/user/domain';
import { match } from 'ts-pattern';
import { DispatchCommand } from '@components/common/dispatchers';
import { createSendConfirmationEmailCommand } from '@components/user/command/commands';

export const onEvent = (dispatch: DispatchCommand) => (event: Event) => {
  match(event)
    .with({ type: 'UserRegistered' }, async e => {
      await dispatch(createSendConfirmationEmailCommand(e.payload.id, e.payload.email))
    })
    .run()
}
