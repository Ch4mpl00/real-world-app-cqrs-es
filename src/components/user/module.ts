import { EventStore } from '@components/common/eventStore'
import { ReadPersistence } from '@components/common/readPersistence'
import { UserProjection } from '@components/user/projections'
import { handleRegisterUserCommand, handleUpdateUserCommand } from '@components/user/command/handlers'
import { Db } from 'mongodb';
import * as Reactions from '@components/user/reactions'
// import * as Projections from '@components/user/projections'
import { DispatchCommand } from '@components/common/dispatchers'
import { Emitter } from 'mitt';
import { DomainEvent } from '@lib/common';

export default {
  handlers: (eventStore: EventStore, persistence: ReadPersistence<UserProjection>) => {
    return {
      handleRegisterUserCommand: handleRegisterUserCommand(eventStore, persistence),
      handleUpdateUserCommand: handleUpdateUserCommand(eventStore, persistence),
    }
  },
  onEvent: (persistence: Db, dispatch: DispatchCommand, emitter: Emitter) => (event: DomainEvent) => [
    () => Reactions.onEvent(dispatch)(event),
    // () => Projections.onEvent(persistence, emitter)(event)
  ]
}
