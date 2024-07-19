import { NotFoundException } from '@utils/errors'
import { CursorPagination, OffsetPagination } from 'types'
import { ExtendedUserViewDTO, UserViewDTO } from '../dto'
import { UserRepository } from '../repository'
import { UserService } from './user.service'
import { BucketManager } from '@utils/s3bucket'
import { FollowRepository } from '../../follow/repository/follow.repository'

export class UserServiceImpl implements UserService {
  constructor (
    private readonly repository: UserRepository,
    private readonly bucketManager: BucketManager,
    private readonly followRepo: FollowRepository) {}

  private async getProfilePicture (picturePath: string): Promise<string> {
    return await this.bucketManager.getImage(picturePath)
  }

  async getLoggedUser (userId: string): Promise<UserViewDTO> {
    const user = await this.repository.getById(userId)
    if (!user) throw new NotFoundException('user')

    if (user.profilePicture) {
      user.profilePicture = await this.bucketManager.getImage(user.profilePicture)
    }

    return user
  }

  async getUser (loggedUserId: string, otherUserId: string): Promise<ExtendedUserViewDTO> {
    const user = await this.repository.getById(otherUserId)
    if (!user) throw new NotFoundException('user')

    if (user.profilePicture) {
      user.profilePicture = await this.bucketManager.getImage(user.profilePicture)
    }

    const followsYou = await this.followRepo.checkFollow(otherUserId, loggedUserId)

    return new ExtendedUserViewDTO({ ...user, followsYou })
  }

  async getUserRecommendations (userId: any, options: OffsetPagination): Promise<UserViewDTO[]> {
    // TODO: make this return only users followed by users the original user follows (DONE)
    const users = await this.repository.getRecommendedUsersPaginated(userId, options)

    for (const user of users) {
      user.profilePicture = user.profilePicture ? await this.getProfilePicture(user.profilePicture) : null
    }

    return users
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
    const user = await this.repository.updateProfilePicture(userId, extension)

    return await this.bucketManager.putImage(user.profilePicture as string)
  }

  async getUsersByUsername (username: string, options: CursorPagination): Promise<UserViewDTO[]> {
    const users = await this.repository.getByUsernamePaginated(username, options)

    for (const user of users) {
      user.profilePicture = user.profilePicture ? await this.getProfilePicture(user.profilePicture) : null
    }

    return users
  }
}
