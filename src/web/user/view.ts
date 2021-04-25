import { UserDomainProjection } from '@components/user/projections'

export const createUserView = (user: UserDomainProjection) => ({
  user: {
    email: user.email,
    username: user.profile.username,
    bio: user.profile.bio,
    image: user.profile.image
  }
})
