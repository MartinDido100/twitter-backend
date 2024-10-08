import { PrismaClient } from '@prisma/client'
import { FollowRepository } from '.'

export class FollowRepositoryImpl implements FollowRepository {
  constructor (private readonly db: PrismaClient) {}

  async getFollowing (userId: string): Promise<string[]> {
    const following = await this.db.follow.findMany({
      where: {
        followerId: userId
      }
    })

    return following.map(follow => follow.followedId)
  }

  async checkFollow (followerId: string, followedId: string): Promise<boolean> {
    const follow = await this.db.follow.findFirst({
      where: {
        followedId,
        followerId
      }
    })
    return follow !== null
  }

  async followUser (userId: string, followUserId: string): Promise<void> {
    await this.db.follow.create({
      data: {
        followedId: followUserId,
        followerId: userId
      }
    })
  }

  async unfollowUser (userId: string, unfollowUserId: string): Promise<void> {
    await this.db.follow.deleteMany({
      where: {
        followedId: unfollowUserId,
        followerId: userId
      }
    })
  }
}
