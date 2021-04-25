/* eslint functional/immutable-data: "off" */
/* eslint functional/no-let: "off" */
/* eslint functional/no-try-statement: "off" */

import 'module-alias/register'
import bodyParser from 'body-parser'
import express, { Request, Response } from 'express'
import { createApp } from '../composition/root'
import { registerUser, updateUser } from './user/actions'

const server = express()
server.set('port', process.env.PORT || 8083)
server.use(bodyParser.json())

function clientErrorHandler (err: Error, req: Request, res: Response, next: Function) {
  if (req.xhr) {
    res.status(500).send({ error: 'Something failed!' })
  } else {
    next(err)
  }
}

server.use(clientErrorHandler)

const app = await createApp('dev')

server.post('/api/register', async (req, res) => registerUser(app)(req, res))
server.put('/api/user/{id}', async (req, res) => updateUser(app)(req, res))

server.listen(server.get('port'), () => {
  console.log(
    '  App is running at http://localhost:%d in %s mode',
    server.get('port'),
    server.get('env')
  )
  console.log('  Press CTRL-C to stop\n')
})
