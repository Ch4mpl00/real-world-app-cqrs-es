import { RegisterUserData, UpdateUserData } from '@components/user/domain'

export type RegisterUser = {
  readonly type: 'RegisterUser'
  readonly data: RegisterUserData
}

export type UpdateUser = {
  readonly type: 'UpdateUser'
  readonly data: UpdateUserData
}

export type Command =
  | RegisterUser
  | UpdateUser
