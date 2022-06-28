import jwt from 'jsonwebtoken';
import { ensure } from 'src/lib/common';

type Signable = {
  id: string,
  email: string
}

export default {
  sign: (signable: Signable) => jwt.sign(
    signable,
    ensure(process.env.SECRET, 'process.env.SECRET required'),
    {
      expiresIn: '2h'
    }
  ),

  verify: (token: string) => jwt.verify(token, ensure(process.env.SECRET, 'process.env.SECRET required'))
};
