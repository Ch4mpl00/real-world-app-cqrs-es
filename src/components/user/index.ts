import { createUserRepository } from '@components/user/repository';
import { createDynamoDbReadRepository } from '@components/user/readRepository';
import { createCommandHandlers } from '@components/user/commands';

export const userRepository = createUserRepository();
export const userReadRepository = createDynamoDbReadRepository(userRepository)
export const command = createCommandHandlers(userRepository, userReadRepository);
