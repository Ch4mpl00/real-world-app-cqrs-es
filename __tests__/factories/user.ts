import { faker } from '@faker-js/faker';
import * as UserDomain from 'src/components/user/domain';

export const createRegistrationData = (id?: string, options?: Partial<UserDomain.RegisterUserData>): UserDomain.RegisterUserData => ({
  id: id ?? faker.datatype.uuid(),
  email: faker.internet.email(),
  password: '123123123',
  username: faker.name.firstName(),
  ...options
})

export const createUser = (id?: string, options?: Partial<UserDomain.RegisterUserData>, timestamp?: number) => {
  const registrationData = createRegistrationData(id, options);
  const updateData = {
    bio: faker.lorem.paragraphs(),
    image: faker.image.lorempixel.cats(100, 100),
  }
  const events = [
    {
      ...UserDomain.createUserRegisteredEvent(registrationData.id, registrationData, timestamp ?? new Date().getTime()),
      version: 1
    },
    {
      ...UserDomain.createUserProfileUpdatedEvent(registrationData.id, updateData, timestamp ?? new Date().getTime()),
      version: 2
    }
  ]

  return UserDomain.restore(registrationData.id, events)
}

export const withFollowees = (user: UserDomain.UserAggregate, followees: string[] = []) => {

  return followees.reduce((agg, followeeId) => {
    return {
      ...UserDomain.applyEvent(
        agg,
        { ...UserDomain.createUserFollowedEvent(agg.id, followeeId, new Date().getTime()), version: agg.version + 1 }
      ),
    }
  }, user)
}
