import { Event, Profile, UserId } from '@components/user/domain'
import { DomainEvent } from '@lib/common';
import { match } from 'ts-pattern';
import { IUserRepository } from '@components/user/repository';

export type UserProjection = {
  readonly id: string
  readonly email: string
  readonly profile: Profile
  readonly follows: ReadonlyArray<UserId>
  readonly createdAt: number
  readonly updatedAt: number
}

export type IUserReadRepository = {
  onEvent: (event: Event) => Promise<void>
  find: (id: string, consistentRead?: boolean) => Promise<UserProjection | null>
  findByEmail: (id: string) => Promise<UserProjection | null>
}

export const createDynamoDbReadRepository = (userRepository: IUserRepository): IUserReadRepository => {

  const find = async (id: string, consistentRead: boolean = false): Promise<UserProjection | null> => {

    if (consistentRead) {
      const events = await userRepository.getEvents(id);

      if (events.length === 0) return null;

      // TODO: default state instead of type casting
      return events.reduce((state, event) => applyEventsOnUserProjection(state, event), {} as UserProjection)
    }

    return {} as Promise<UserProjection | null>
  }

  const findByEmail = async (email: string): Promise<UserProjection | null> => {
    return {} as Promise<UserProjection | null>
  }

  const save = async (projection: UserProjection): Promise<void | Error> => {

  }

  const onEvent = async (event: Event) => {
    if (event.aggregate !== 'user') return;

    const projection = await find(event.aggregateId);

    if (!projection) return;

    await save(applyEventsOnUserProjection(projection, event))
  }

  return {
    onEvent,
    find,
    findByEmail
  }
}

export const applyEventsOnUserProjection = (user: UserProjection, event: DomainEvent) => {
  return match(event as Event)
    .with({ type: 'UserRegistered' }, (event): UserProjection => ({
      id: event.aggregateId,
      email: event.payload.email,
      follows: [],
      profile: {
        bio: '',
        image: null,
        username: event.payload.username
      },
      createdAt: new Date().getTime(),
      updatedAt: new Date().getTime()
    }))
    .with({ type: 'UserEmailChanged' }, (event) => ({
      ...user,
      email: event.payload.newEmail,
      updatedAt: new Date().getTime()
    }))
    .with({ type: 'UserProfileUpdated' }, (event) => ({
      ...user,
      updatedAt: new Date().getTime(),
      profile: {
        bio: event.payload.bio ?? user.profile.bio,
        username: event.payload.username ?? user.profile.username,
        image: event.payload.image !== undefined ? event.payload.image : user.profile.image,
      }
    }))
    .with({ type: 'UserFollowed' }, (event) => ({
      ...user,
      updatedAt: new Date().getTime(),
      follows: [...user.follows, event.payload.followedTo]
    }))
    .with({ type: 'UserUnfollowed' }, (event) => ({
      ...user,
      updatedAt: new Date().getTime(),
      follows: user.follows.filter(followedId => followedId !== event.payload.unfollowedFrom)
    }))
    .exhaustive()
}
