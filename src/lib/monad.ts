export type Error<E> = {
  readonly type: 'Error',
  readonly error: E
  readonly ok: false
}

type Success<T> = {
  readonly type: 'Success',
  readonly value: T
  readonly ok: true
}

export type Result<T, E> =
  | Success<T>
  | Error<E>

export const ok = <T> (val: T): Success<T> => {
  return {
    type: 'Success',
    value: val,
    ok: true
  }
}

export const error = <T> (val: T): Error<T> => {
  return {
    type: 'Error',
    error: val,
    ok: false
  }
}

export type OptionSome<T> = {
  readonly type: 'Some'
  readonly isSome: true
  readonly isNone: false
  readonly some: T
}

export type OptionNone = {
  readonly type: 'None'
  readonly isSome: false
  readonly isNone: true
}

export type Option<T> =
  | OptionSome<T>
  | OptionNone

export const Some = <T> (value: T): OptionSome<T> => ({
  type: 'Some',
  some: value,
  isSome: true,
  isNone: false
})

export const None = (): OptionNone => ({
  type: 'None',
  isSome: false,
  isNone: true
})

export function matchResult<T, E> (res: Result<T, E>) {
  return {
    with: <Y, Z> (
      onSuccess: (s: T) => Y,
      onError: (e: E) => Z
    ): Y | Z => {
      switch (res.type) {
        case 'Success':
          return onSuccess(res.value)
        case 'Error':
          return onError(res.error)
      }
    }
  }
}

export function matchOption<T> (res: Option<T>) {
  return {
    with: <Y, Z> (
      onSome: (s: T) => Y,
      onNone: () => Z
    ): Y | Z => {
      switch (res.type) {
        case 'Some':
          return onSome(res.some)
        case 'None':
          return onNone()
      }
    }
  }
}
