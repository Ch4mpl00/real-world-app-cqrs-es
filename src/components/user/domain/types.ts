export type UserId = string

export type RegisterUserData = {
  readonly id: UserId
  readonly email: string
  readonly password: string
  readonly username: string
}

export type UpdateUserData = {
  readonly id: UserId;
  readonly username?: string;
  readonly email?: string
  readonly password?: string
  readonly bio?: string
  readonly image?: string | null
}

export type Profile = {
  readonly username: string
  readonly bio: string
  readonly image: string | null
}

export type User = {
  readonly id: string
  readonly email: string
  readonly password: string
  readonly profile: Profile
  readonly follows: ReadonlyArray<UserId>
}
