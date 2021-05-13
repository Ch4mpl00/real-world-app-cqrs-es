import { registerUserDataSchema, updateUserDataSchema } from '@components/user/command/commands'
import { App } from '../../composition/root'
import { Request, Response } from 'express'
import { createErrorView } from '../lib'
import { v4 as createUuid } from 'uuid'
import { createUserView } from './view'
import { UserProjectionEvent } from '@components/user/projections'
// import { match } from 'ts-pattern';

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
  const result = await app.handleCommand({
    type: 'RegisterUser',
    data: { ...data.value, id }
  })

  if (result.ok) {
    // As we deal with an eventually consistent system
    // we can't just call read model to get user immediately after command has been executed
    // as it does not guarantee that projection has been stored
    app.on(UserProjectionEvent.DomainUserProjectionSaved, async projectedUserId => {
      if (projectedUserId !== id) return

      const user = await app.query.user.findOne(id)
      user.isSome
        ? res.status(200).send(createUserView(user.some))
        : res.status(500).send(createErrorView('Something went wrong, please try again later'))
    })

    return
  }

  // match(result.error.type)
  //   .with('EmailAlreadyExists', () => res.status(422).send(createErrorView('email already exists')))
  //   .exhaustive()
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

  const result = await app.handleCommand({
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
