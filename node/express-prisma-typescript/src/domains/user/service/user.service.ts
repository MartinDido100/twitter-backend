import { CursorPagination, OffsetPagination } from '@types'
import { UserViewDTO } from '../dto'
import { ExtendedUserViewDTO } from '../dto/index'

export interface UserService {
  deleteUser: (userId: any) => Promise<void>
  getUser: (loggedUserId: any, userId: any) => Promise<ExtendedUserViewDTO>
  getLoggedUser: (userId: any) => Promise<UserViewDTO>
  getUserRecommendations: (userId: any, options: OffsetPagination) => Promise<UserViewDTO[]>
  privateUser: (userId: any) => Promise<void>
  unprivateUser: (userId: any) => Promise<void>
  updateProfilePicture: (userId: string, extension: string) => Promise<string>
  getUsersByUsername: (username: string, options: CursorPagination) => Promise<UserViewDTO[]>

}
