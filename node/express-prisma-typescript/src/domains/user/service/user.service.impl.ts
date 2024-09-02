import { NotFoundException } from '@utils/errors'
import { CursorPagination, OffsetPagination } from 'types'
import { ExtendedUserViewDTO, LoggedUserViewDTO, UserViewDTO } from '../dto'
import { UserRepository } from '../repository'
import { UserService } from './user.service'
import { BucketManager } from '@utils/s3bucket'
import { FollowRepository } from '../../follow/repository/follow.repository'

export class UserServiceImpl implements UserService {
  constructor (
    private readonly repository: UserRepository,
    private readonly bucketManager: BucketManager,
    private readonly followRepo: FollowRepository
  ) {}

  async getLoggedUser (userId: string): Promise<LoggedUserViewDTO> {
    const user = await this.repository.getById(userId)
    if (!user) throw new NotFoundException('user')

    if (user.profilePicture) {
      user.profilePicture = await this.bucketManager.getImage(user.profilePicture)
    }

    const following = await this.followRepo.getFollowing(userId)

    return new LoggedUserViewDTO({ ...user, following })
  }

  async getUser (loggedUserId: string, otherUserId: string): Promise<ExtendedUserViewDTO> {
    const user = await this.repository.getById(otherUserId)
    if (!user) throw new NotFoundException('user')

    user.profilePicture = user.profilePicture ? await this.bucketManager.getImage(user.profilePicture) : null

    const followsYou = await this.followRepo.checkFollow(otherUserId, loggedUserId)
    const following = await this.followRepo.checkFollow(loggedUserId, otherUserId)

    return new ExtendedUserViewDTO({ ...user, followsYou, following })
  }

  async getUserRecommendations (userId: any, options: OffsetPagination): Promise<UserViewDTO[]> {
    // TODO: make this return only users followed by users the original user follows (DONE)
    const users = await this.repository.getRecommendedUsersPaginated(userId, options)

    for (const user of users) {
      user.profilePicture = user.profilePicture ? await this.bucketManager.getImage(user.profilePicture) : null
    }

    return users.filter(user => user.id !== userId);
  }

  async deleteUser (userId: any): Promise<void> {
    await this.repository.delete(userId)
  }

  async privateUser (userId: any): Promise<void> {
    await this.repository.privateUser(userId)
  }

  async unprivateUser (userId: any): Promise<void> {
    await this.repository.unprivateUser(userId)
  }

  async updateProfilePicture (userId: string, extension: string): Promise<string> {
    const profilePicture = await this.repository.updateProfilePicture(userId, extension)

    return await this.bucketManager.putImage(profilePicture)
  }

  async getUsersByUsername (username: string, options: CursorPagination): Promise<UserViewDTO[]> {
    const users = await this.repository.getByUsernamePaginated(username, options)

    for (const user of users) {
      user.profilePicture = user.profilePicture ? await this.bucketManager.getImage(user.profilePicture) : null
    }

    return users
  }
}
