/* eslint functional/immutable-data: "off" */
/* eslint functional/no-let: "off" */
/* eslint functional/no-try-statement: "off" */

import 'module-alias/register'
import bodyParser from 'body-parser'
import express, { Request, Response } from 'express'
import { createApp } from '../composition/root'
import { registerUser, updateUser } from './user/actions'
import jwt from 'express-jwt';

const server = express()
server.set('port', process.env.PORT || 8083)
server.use(bodyParser.json())

server.use(jwt({
  secret: 'veryverysecret1',
  algorithms: ['HS256'],
  credentialsRequired: false,
  getToken: function fromHeaderOrQuerystring (req) {
    if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
      return req.headers.authorization.split(' ')[1];
    } else if (req.query && req.query.token) {
      return req.query.token;
    }
    return null;
  }
}));

server.use(function (err: Error, req: Request, res: Response, next: Function) {
  if (err.name === 'UnauthorizedError') {
    res.status(401).send('invalid token...');
  }
});

function clientErrorHandler (err: Error, req: Request, res: Response, next: Function) {
  if (req.xhr) {
    res.status(500).send({ error: 'Something failed!' })
  } else {
    next(err)
  }
}

server.use(clientErrorHandler)

const app = createApp('dev')

server.post('/api/users', async (req, res) => registerUser(await app)(req, res))
server.put('/api/users/login', async (req, res) => updateUser(await app)(req, res))
server.listen(server.get('port'), () => {
  console.log(
    '  App is running at http://localhost:%d in %s mode',
    server.get('port'),
    server.get('env')
  )
  console.log('  Press CTRL-C to stop\n')
})
