import Joi from 'joi'

export const registerUserDataSchema = Joi.object({
  email: Joi.string().email(),
  password: Joi.string().min(8),
  username: Joi.string().min(2)
})
