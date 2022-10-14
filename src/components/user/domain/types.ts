import { UserDomainEvent } from 'src/components/user/domain';

export type UserId = string

export type RegisterUserData = {
  readonly id: string
  readonly email: string
  readonly password: string
  readonly username: string
}

export type UpdateUserData = {
  readonly username?: string;
  readonly email?: string
  readonly password?: string
  readonly bio?: string
  readonly image?: string | null
}

export type UserAggregate = {
  readonly id: string
  readonly version: number
  readonly type: 'user'
  readonly state: {
    readonly email: string
    readonly password: string
    readonly username: string
    readonly bio: string
    readonly image: string | null
    readonly follows: ReadonlyArray<UserId>
  }
  readonly newEvents: UserDomainEvent[]
}

export type AuthorizerIncomeRequestType = {
  headers: {
    Authorization?: string | undefined,
    Cookie?: string | undefined,
    cookie?: string | undefined,
    authorization?: string | undefined
  },
  methodArn: string
}
