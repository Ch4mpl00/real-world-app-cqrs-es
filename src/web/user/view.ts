import { UserProjection } from '@components/user/readModel'

export const createUserView = (user: UserProjection) => ({
  user: {
    email: user.email,
    username: user.profile.username,
    bio: user.profile.bio,
    image: user.profile.image
  }
})
