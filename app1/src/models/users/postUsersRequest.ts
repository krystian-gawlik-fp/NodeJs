import { Role } from '../../enums/role'

export interface PostUsersRequest {
  email: string
  password: string
  role: Role
}
