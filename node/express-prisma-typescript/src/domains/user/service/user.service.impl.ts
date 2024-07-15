import { NotFoundException } from '@utils/errors'
import { OffsetPagination } from 'types'
import { UserViewDTO } from '../dto'
import { UserRepository } from '../repository'
import { UserService } from './user.service'
import { BucketManager } from '@utils/s3bucket'

export class UserServiceImpl implements UserService {
  constructor (private readonly repository: UserRepository, private readonly bucketManager: BucketManager) {}

  private async getProfilePicture (picturePath: string): Promise<string> {
    return await this.bucketManager.getImage(picturePath)
  }

  async getUser (userId: string): Promise<UserViewDTO> {
    const user = await this.repository.getById(userId)
    if (!user) throw new NotFoundException('user')

    if (user.profilePicture) {
      user.profilePicture = await this.bucketManager.getImage(user.profilePicture)
    }

    return user
  }

  async getUserRecommendations (userId: any, options: OffsetPagination): Promise<UserViewDTO[]> {
    // TODO: make this return only users followed by users the original user follows
    const users = await this.repository.getRecommendedUsersPaginated(userId, options)

    for (const user of users) {
      if (user.profilePicture) {
        user.profilePicture = await this.bucketManager.getImage(user.profilePicture)
      }
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

    return await this.bucketManager.putImage(user.profilePicture ?? '')
  }
}
