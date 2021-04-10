export type EmailAlreadyExists = {
  readonly type: 'EmailAlreadyExists'
  readonly email: string
}

export type Error =
  | EmailAlreadyExists
