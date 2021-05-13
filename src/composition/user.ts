import { handleRegisterUserCommand, handleUpdateUserCommand } from '@components/user/command/handlers'
import { EventStore } from '@components/common/eventStore'
import { Db } from 'mongodb'
import { ReadPersistence, persistence } from '@components/common/readPersistence'
import { UserProjection } from '@components/user/projections'


export const setUpPersistence = (db: Db) => {
  const _persistence = persistence(db)

  return _persistence<UserProjection>('users')
}

export const setupCommandHandlers = (eventStore: EventStore, persistence: ReadPersistence<UserProjection>) => {
  return {
    handleRegisterUserCommand: handleRegisterUserCommand(eventStore, persistence),
    handleUpdateUserCommand: handleUpdateUserCommand(eventStore, persistence)
  }
}
