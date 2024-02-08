import { Users } from '../../database'

const getCurrentUserQuery = Users.createQuery('users:get_current_user', {
  username: 1,
  language: 1
})

export default getCurrentUserQuery
