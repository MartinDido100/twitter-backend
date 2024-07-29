import { ConflictException } from '@utils'
import { FollowRepositoryImpl } from '../repository'
import { FollowService } from '.'

export class FollowServiceImpl implements FollowService {
  constructor (private readonly repository: FollowRepositoryImpl) {}

  async followUser (userId: string, followUserId: string): Promise<void> {
    if (userId === followUserId) {
      throw new ConflictException('CANNOT_FOLLOW_YOURSELF')
    }

    const following = await this.repository.checkFollow(userId, followUserId)
    if (following) {
      throw new ConflictException('USER_ALREADY_FOLLOWED')
    }

    await this.repository.followUser(userId, followUserId)
  }

  async unfollowUser (userId: string, unfollowUserId: string): Promise<void> {
    if (userId === unfollowUserId) {
      throw new ConflictException('CANNOT_UNFOLLOW_YOURSELF')
    }

    const following = await this.repository.checkFollow(userId, unfollowUserId)

    if (!following) {
      throw new ConflictException('USER_NOT_FOLLOWED')
    }

    await this.repository.unfollowUser(userId, unfollowUserId)
  }
}
