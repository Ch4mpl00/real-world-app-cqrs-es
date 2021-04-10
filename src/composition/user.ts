import { handleRegisterUserCommand, handleUpdateUserCommand } from '@components/user/commandHandler'
import { EventStore } from '@components/common/eventStore'

export const setupCommandHandlers = (eventStore: EventStore) => ({
  handleRegisterUserCommand: handleRegisterUserCommand(eventStore),
  handleUpdateUserCommand: handleUpdateUserCommand(eventStore)
})
