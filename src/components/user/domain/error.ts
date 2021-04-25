export type EmailAlreadyExists = {
  readonly type: 'EmailAlreadyExists'
  readonly email: string
}

export type Error =
  | EmailAlreadyExists

export const createEmailAlreadyExistsError = (email: string): EmailAlreadyExists => ({
  type: 'EmailAlreadyExists',
  email
})
