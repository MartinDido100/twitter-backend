import { PrismaClient } from '@prisma/client'
import { FollowRepository } from './follow.repository'

export class FollowRepositoryImpl implements FollowRepository {
  constructor (private readonly db: PrismaClient) {}

  // TODO: Ver si es necesario chequear la existencia de a quien sigo o sino como manejo el error

  async checkFollow (userId: string, followUserId: string): Promise<boolean> {
    const follow = await this.db.follow.findFirst({
      where: {
        followedId: followUserId,
        followerId: userId
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
    await this.db.follow.deleteFirst({
      where: {
        followedId: unfollowUserId,
        followerId: userId
      }
    })
  }
}
