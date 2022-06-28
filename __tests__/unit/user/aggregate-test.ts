import * as UserDomain from 'src/components/user/domain'
import { createRegistrationData, createUser, withFollowees } from '../../factories';

describe('User aggregate', () => {
  describe('Register user', () => {
    test('it should create UserRegistered event', () => {
      const data = createRegistrationData()
      const context = { timestamp: new Date().getTime(), emailAlreadyExists: false }
      const result = UserDomain.registerUser(data.id, data, context)

      expect(result.isOk).toBe(true)
      expect(result.unwrap().newEvents).toStrictEqual([
        {
          ...UserDomain.createUserRegisteredEvent(data.id, data, context.timestamp),
          version: 1
        }
      ])
    })

    test('it should return error if email already exists', () => {
      const data = createRegistrationData()
      const context = { timestamp: new Date().getTime(), emailAlreadyExists: true }
      const result = UserDomain.registerUser(data.id, data, context)

      expect(result.isErr).toBe(true)

      if (result.isErr) {
        expect(result.error.name).toBe('EmailAlreadyExists')
      }
    })
  })

  describe('Update user data', () => {
    test('it should create UserEmailChanged if user has updated email', () => {
      const user = createUser();
      const context = { timestamp: new Date().getTime(), emailAlreadyExists: false }
      const newEmail = 'newemail@foo.com';
      const result = UserDomain.updateUser(user, { email: newEmail }, context)

      expect(result.isOk).toBe(true)
      expect(result.unwrap().newEvents.length).toBe(2)

      expect(result.unwrap().newEvents[0]).toStrictEqual({
        ...UserDomain.createUserEmailChangedEvent(user.id, newEmail, user.state.email, context.timestamp),
        version: user.version + 1
      })

      expect(result.unwrap().newEvents[1]).toStrictEqual({
        ...UserDomain.createUserProfileUpdatedEvent(user.id, { email: newEmail }, context.timestamp),
        version: user.version + 2
      })
    })

    test('it should return error when email changed to existing email', () => {
      const user = createUser();
      const context = { timestamp: new Date().getTime(), emailAlreadyExists: true }
      const newEmail = 'newemail@foo.com';
      const result = UserDomain.updateUser(user, { email: newEmail }, context)

      expect(result.isErr).toBe(true)

      if (result.isErr) {
        expect(result.error.name).toBe('EmailAlreadyExists')
      }
    })

    test('it should not create UserEmailChanged if email is not present in update data', () => {
      const user = createUser();
      const context = { timestamp: new Date().getTime(), emailAlreadyExists: false }
      const updateData = { bio: 'yo!' } // Just random field updated
      const result = UserDomain.updateUser(user, updateData, context)

      expect(result.isOk).toBe(true)
      expect(result.unwrap().newEvents.length).toBe(1)

      expect(result.unwrap().newEvents[0]).toStrictEqual({
        ...UserDomain.createUserProfileUpdatedEvent(user.id, updateData, context.timestamp),
        version: user.version + 1
      })
    })

    test('it should not create UserEmailChanged if email has not been changed', () => {
      const user = createUser();
      const context = { timestamp: new Date().getTime(), emailAlreadyExists: true }
      const updateData = { email: user.state.email }
      const result = UserDomain.updateUser(user, updateData, context)

      expect(result.isOk).toBe(true)
      expect(result.unwrap().newEvents.length).toBe(1)

      expect(result.unwrap().newEvents[0]).toStrictEqual({
        ...UserDomain.createUserProfileUpdatedEvent(user.id, updateData, context.timestamp),
        version: user.version + 1
      })
    })

    test('it should not create any event if update data is empty', () => {
      const user = createUser();
      const context = { timestamp: new Date().getTime(), emailAlreadyExists: false }
      const updateData = {}
      const result = UserDomain.updateUser(user, updateData, context)

      expect(result.isOk).toBe(true)
      expect(result.unwrap().newEvents.length).toBe(0)
    })
  })

  describe('Followings', () => {
    test('it should add follower', () => {
      const follower = createUser();
      const followee = createUser();
      const context = { timestamp: new Date().getTime() }

      const result = UserDomain.followUser(follower, followee.id, context)
      expect(result.isOk).toBe(true)
      expect(result.unwrap().newEvents).toStrictEqual([{
        ...UserDomain.createUserFollowedEvent(follower.id, followee.id, context.timestamp),
        version: follower.version + 1
      }])
    })

    test('it should not add follower if already follows', () => {
      const followee = createUser();
      const follower = withFollowees(createUser(), [followee.id]);
      const context = { timestamp: new Date().getTime() }

      const result = UserDomain.followUser(follower, followee.id, context)
      expect(result.isOk).toBe(true)
      expect(result.unwrap().newEvents.length).toBe(0)
    })
  })

  test('it should unfollow user', () => {
    const followee = createUser();
    const follower = withFollowees(createUser(), [followee.id]);
    const context = { timestamp: new Date().getTime() }

    const result = UserDomain.unfollowUser(follower, followee.id, context)
    expect(result.isOk).toBe(true)
    expect(result.unwrap().newEvents).toStrictEqual([{
      ...UserDomain.createUserUnfollowedEvent(follower.id, followee.id, context.timestamp),
      version: follower.version + 1
    }])
  })

  test('it should not unfollow user if not followed', () => {
    const user = createUser();
    const context = { timestamp: new Date().getTime() }

    const result = UserDomain.unfollowUser(user, 'random-user-id', context)
    expect(result.isOk).toBe(true)
    expect(result.unwrap().newEvents.length).toBe(0)
  })
})
