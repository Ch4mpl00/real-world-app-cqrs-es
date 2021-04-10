/* eslint functional/immutable-data: "off" */
/* eslint functional/no-let: "off" */
/* eslint functional/no-try-statement: "off" */
import { registerUserDataSchema } from '@components/user/validation'
import { RegisterUserData } from '@components/user/domain'
import { assertUnreachable } from '@lib/common'
import { App } from '../../composition/root'
import { Request } from 'express'
import { createErrorResponse, createResponse } from '../lib'

export const registerUser = (app: App) => async (req: Request) => {
  const data = registerUserDataSchema.validate(req.body.user)
  if (data.error) {
    return createErrorResponse(data.error.message, 422)
  }

  const result = await app.handleCommand({
    type: 'RegisterUser',
    data: data.value as RegisterUserData
  })

  if (result.isSuccess) {
    return createResponse({ user: 'ok' }, 200)
  }

  switch (result.error.type) {
    case 'EmailAlreadyExists':
      return createErrorResponse('email already exists', 422)
    default:
      assertUnreachable(result.error.type)
  }
}
