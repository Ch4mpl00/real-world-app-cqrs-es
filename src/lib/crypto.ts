import bcrypt from 'bcrypt'
const saltRounds = 10

export const hash = async (value: string) => {
  return bcrypt.hash(value, saltRounds)
}
