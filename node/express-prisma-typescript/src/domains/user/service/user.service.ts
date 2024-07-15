import { OffsetPagination } from '@types'
import { UserViewDTO } from '../dto'

export interface UserService {
  deleteUser: (userId: any) => Promise<void>
  getUser: (userId: any) => Promise<UserViewDTO>
  getUserRecommendations: (userId: any, options: OffsetPagination) => Promise<UserViewDTO[]>
  privateUser: (userId: any) => Promise<void>
  unprivateUser: (userId: any) => Promise<void>
  updateProfilePicture: (userId: string, extension: string) => Promise<string>
}
