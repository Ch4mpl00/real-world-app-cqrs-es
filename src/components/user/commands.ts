import { assert } from '@lib/common'
import * as UserDomain from '@components/user/domain'
import { RegisterUserData, UpdateUserData, UserId } from '@components/user/domain';
import { IUserRepository } from '@components/user/repository';
import { IUserReadRepository } from '@components/user/readRepository';
import Joi from 'joi';
import bcrypt from 'bcryptjs'
import { Result } from '@badrap/result';

const registerUserDataSchema = Joi.object({
  email: Joi.string().email(),
  password: Joi.string().min(8),
  username: Joi.string().min(2),
  id: Joi.string().optional()
})

const updateUserDataSchema = Joi.object({
  email: Joi.string().email().optional(),
  username: Joi.string().min(2).optional(),
  bio: Joi.string().optional(),
  image: Joi.string().optional()
})

const sendEmailConfirmationSchema = Joi.object({
  email: Joi.string().email().optional(),
  id: Joi.string()
})

export const createCommandHandlers = (
  userRepository: IUserRepository,
  userReadRepository: IUserReadRepository
) => ({
  registerUser: async (data: RegisterUserData) => {
    assert(data, registerUserDataSchema)

    const result = UserDomain.registerUser(data.id, {
      ...data,
      password: await bcrypt.hash(data.password, 10)
    }, {
      emailAlreadyExists: !!(await userReadRepository.findByEmail(data.email)),
      timestamp: new Date().getTime()
    })

    if (result.isOk) {
      const saveResult = await userRepository.save(result.value);
      if (saveResult.isErr) {
        return saveResult;
      }
    }

    return result
  },

  updateUser: async (id: string, data: UpdateUserData) => {
    assert(data, updateUserDataSchema)

    const user = await userRepository.get(id);

    if (!user) {
      return Result.err({ name: 'UserNotFound', message: 'User not found', id })
    }

    const result = UserDomain.updateUser(user, data, {
      emailAlreadyExists: data.email ?
        !!(await userReadRepository.findByEmail(data.email))
        : false,
      timestamp: new Date().getTime()
    })

    if (result.isOk) {
      await userRepository.save(result.value)
    }

    return result;
  },

  followUser: async (followerId: string, followeeId: string) => {
    const follower = await userRepository.get(followerId);
    const followable = await userRepository.get(followeeId);

    if (!follower) {
      return Result.err({ name: 'UserNotFound', message: 'User not found', id: followerId })
    }

    if (!followable) {
      return Result.err({ name: 'UserNotFound', message: 'User not found', id: followeeId })
    }

    const result = UserDomain.followUser(follower, followable.id, { timestamp: new Date().getTime() })

    if (result.isOk) {
      await userRepository.save(result.value)
    }

    return result
  },

  unfollowUser: async (followerId: string, followeeId: string) => {
    const follower = await userRepository.get(followerId);
    const followable = await userRepository.get(followeeId);

    if (!follower) {
      return Result.err({ name: 'UserNotFound', message: 'User not found', id: followerId })
    }

    if (!followable) {
      return Result.err({ name: 'UserNotFound', message: 'User not found', id: followeeId })
    }

    const result = UserDomain.unfollowUser(follower, followable.id, { timestamp: new Date().getTime() })

    if (result.isOk) {
      await userRepository.save(result.value)
    }

    return result
  },

  sendConfirmationEmail: async (data: { readonly id: UserId, readonly email: string }): Promise<void> => {
    assert(data, sendEmailConfirmationSchema)

    console.log(`Sent confirmation email to ${data.email}`)
    // create confirmation token
    // send an email
  }
})
