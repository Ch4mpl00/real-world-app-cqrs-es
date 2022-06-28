export type EmailAlreadyExists = {
  readonly name: 'EmailAlreadyExists'
  message: string,
  readonly email: string
}

export type Error =
  | EmailAlreadyExists

export const createEmailAlreadyExistsError = (email: string): EmailAlreadyExists => ({
  name: 'EmailAlreadyExists',
  message: `User with email ${email} not found`,
  email
});
