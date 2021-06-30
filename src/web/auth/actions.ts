import { App } from '../../composition/root';
import { Request, Response } from 'express';
import { createErrorView } from '../lib';

export const login = (app: App) => async (req: Request, res: Response) => {
  const token = await app.auth.query.getAuthTokenByCredentials(
    req.body.user.email as string,
    req.body.user.password as string,
  )

  token.isSome
    ? res.status(200).send({ token: token.some })
    : res.status(401).send(createErrorView('Invalid credentials'))
}
