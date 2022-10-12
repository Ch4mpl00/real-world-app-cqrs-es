import { assert } from 'src/lib/common';
import * as UserDomain from 'src/components/user/domain';
import {
  createUserNotFoundError, RegisterUserData, UpdateUserData, UserId
} from 'src/components/user/domain';
import { IUserRepository } from 'src/components/user/repository';
import { IUserReadRepository } from 'src/components/user/readRepository';
import Joi from 'joi';
import bcrypt from 'bcryptjs';
import { Result } from '@badrap/result';

const registerUserDataSchema = Joi.object({
  email: Joi.string().email(),
  password: Joi.string().min(8),
  username: Joi.string().min(2),
  id: Joi.string().optional()
});

const updateUserDataSchema = Joi.object({
  email: Joi.string().email().optional(),
  username: Joi.string().min(2).optional(),
  bio: Joi.string().optional(),
  image: Joi.string().optional()
});

export const createCommandHandlers = (
  userRepository: IUserRepository,
  userReadRepository: IUserReadRepository
) => ({
  registerUser: async (data: RegisterUserData) => {
    assert(data, registerUserDataSchema);

    const context = {
      emailAlreadyExists: !!(await userReadRepository.findByEmail(data.email)),
      timestamp: new Date().getTime()
    };

    const result = UserDomain.registerUser(
      data.id,
      { ...data, password: await bcrypt.hash(data.password, 10) },
      context
    );

    if (result.isOk) await userRepository.save(result.value);

    return result;
  },

  updateUser: async (id: UserId, data: UpdateUserData) => {
    assert(data, updateUserDataSchema);

    const user = await userRepository.get(id);

    if (!user) return Result.err(createUserNotFoundError(`User with id: ${id} not found`));

    const context = {
      emailAlreadyExists: data.email
        ? !!(await userReadRepository.findByEmail(data.email))
        : false,
      timestamp: new Date().getTime()
    };

    const result = UserDomain.updateUser(user, data, context);

    if (result.isOk) await userRepository.save(result.value);

    return result;
  },

  followUser: async (followerId: UserId, followeeId: UserId) => {
    const follower = await userRepository.get(followerId);
    const followee = await userRepository.get(followeeId);

    if (!follower) return Result.err(createUserNotFoundError());
    if (!followee) return Result.err(createUserNotFoundError());

    const result = UserDomain.followUser(follower, followee.id, { timestamp: new Date().getTime() });

    if (result.isOk) await userRepository.save(result.value);

    return result;
  },

  unfollowUser: async (followerId: UserId, followeeId: UserId) => {
    const follower = await userRepository.get(followerId);
    const followee = await userRepository.get(followeeId);

    if (!follower) return Result.err(createUserNotFoundError());
    if (!followee) return Result.err(createUserNotFoundError());

    const result = UserDomain.unfollowUser(follower, followee.id, { timestamp: new Date().getTime() });

    if (result.isOk) await userRepository.save(result.value);

    return result;
  }
});
