import { registerUserDataSchema, updateUserDataSchema } from '@components/user/command/commands'
import { App } from '../../composition/root'
import { Request, Response } from 'express'
import { createErrorView } from '../lib'
import { v4 as createUuid } from 'uuid'
import { match } from 'ts-pattern';

/*
* ====================
* Register user action
* ====================
* */
export const registerUser = (app: App) => async (req: Request, res: Response): Promise<void> => {
  const data = registerUserDataSchema.validate(req.body.user)
  if (data.error) {
    res.status(422).send(createErrorView(data.error.message))
    return
  }

  const id = createUuid()
  const result = await app.user.command.registerUser({
    type: 'RegisterUser',
    data: { ...data.value, id }
  })

  if (result.ok) {
    const projection = await app.user.query.fresh(id)
    projection.isSome
      ? res.status(200).send(projection.some.profile)
      : res.status(500).send('Something went wrong')

    return
  }

  match(result.error.type)
    .with('EmailAlreadyExists', () => res.status(422).send(createErrorView('email already exists')))
    .exhaustive()
}

/*
* ==================
* Update user action
* ==================
* */
export const updateUser = (app: App) => async (req: Request, res: Response) => {
  const data = updateUserDataSchema.validate(req.body.user)

  if (data.error) {
    res.status(422).send(createErrorView(data.error.message))
    return
  }

  const result = await app.user.command.updateUser({
    type: 'UpdateUser',
    data: data.value
  })

  if (result.ok) {
    res.status(200).send({ user: 'ok' })
    return
  }

  // match(result.error.type)
  //   .with('EmailAlreadyExists', () => res.status(422).send(createErrorView('email already exists')))
  //   .exhaustive()
}
