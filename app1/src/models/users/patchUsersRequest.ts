import { Role } from '../../enums/role'

export interface PatchUsersRequest {
  email: string
  password: string
  role: Role
}
