import { RegisterUserData, UpdateUserData, UserId } from '@components/user/domain'
import Joi from 'joi';

export type RegisterUser = {
  readonly type: 'RegisterUser'
  readonly data: RegisterUserData
}

export type UpdateUser = {
  readonly type: 'UpdateUser'
  readonly data: UpdateUserData
}

export type SendConfirmationEmail = {
  readonly type: 'SendConfirmationEmail'
  readonly data: {
    readonly id: UserId
    readonly email: string
  }
}

export type ConfirmEmail = {
  readonly type: 'ConfirmEmail'
  readonly data: {
    readonly id: UserId
    readonly email: string
    readonly token: string
  }
}

export type Commands =
  | RegisterUser
  | UpdateUser
  | SendConfirmationEmail

export const createSendConfirmationEmailCommand = (id: UserId, email: string): SendConfirmationEmail => ({
  type: 'SendConfirmationEmail',
  data: { id, email }
})

export const registerUserDataSchema = Joi.object({
  email: Joi.string().email(),
  password: Joi.string().min(8),
  username: Joi.string().min(2),
  id: Joi.string().optional()
})

export const updateUserDataSchema = Joi.object({
  email: Joi.string().email().optional(),
  username: Joi.string().min(2).optional(),
  bio: Joi.string().optional(),
  image: Joi.string().optional()
})


export const sendEmailConfirmationSchema = Joi.object({
  email: Joi.string().email().optional(),
  id: Joi.string()
})
