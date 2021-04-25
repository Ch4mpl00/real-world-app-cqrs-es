import { EventStore } from '@components/common/eventStore'
import { ReadPersistence } from '@components/common/readPersistence'
import { UserDomainProjection } from '@components/user/projections'
import { handleRegisterUserCommand, handleUpdateUserCommand } from '@components/user/command/handlers'
import { Db } from 'mongodb';
import * as Reactions from '@components/user/reactions'
// import * as Projections from '@components/user/projections'
import { Event } from '@components/user/domain'
import { DispatchCommand } from '@components/common/dispatchers'
import { Emitter } from 'mitt';

export default {
  handlers: (eventStore: EventStore, persistence: ReadPersistence<UserDomainProjection>) => {
    return {
      handleRegisterUserCommand: handleRegisterUserCommand(eventStore, persistence),
      handleUpdateUserCommand: handleUpdateUserCommand(eventStore, persistence),
    }
  },
  listeners: (persistence: Db, dispatch: DispatchCommand, emitter: Emitter) => (event: Event) => [
    () => Reactions.onEvent(dispatch)(event),
    // () => Projections.onEvent(persistence, emitter)(event)
  ]
}
