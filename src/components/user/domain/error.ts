export type EmailAlreadyExists = {
  readonly name: 'EmailAlreadyExists'
  readonly message: string,
  readonly email: string
}

export type UserNotFound = {
  readonly name: 'UserNotFound'
  readonly message: string,
}

export type CannotFollowYourself = {
  readonly name: 'CannotFollowYourself'
  readonly message: string,
}

export type UserDomainError =
  | EmailAlreadyExists
  | UserNotFound
  | CannotFollowYourself

export const createEmailAlreadyExistsError = (email: string): EmailAlreadyExists => ({
  name: 'EmailAlreadyExists',
  message: `User with email ${email} not found`,
  email
});

export const createUserNotFoundError = (message?: string): UserNotFound => ({
  name: 'UserNotFound',
  message: message ?? 'User not found',
});

export const createCannotFollowYourselfError = (message?: string): CannotFollowYourself => ({
  name: 'CannotFollowYourself',
  message: message ?? 'User not found',
});
