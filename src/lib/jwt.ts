import jwt from 'jsonwebtoken'
import { ensure } from '@lib/common';

type Signable = {
  id: string,
  email: string
}

export const sign = (signable: Signable) => {
  return jwt.sign(
    signable,
    ensure(process.env.SECRET, 'process.env.SECRET required'),
    {
      expiresIn: "2h",
    })
}
