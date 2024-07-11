import { PrismaClient } from '@prisma/client'
import { ReactionRepository } from './reaction.repository'
import { ReactionDTO, ReactionEnum } from '../dto'

export class ReactionRepositoryImpl implements ReactionRepository {
  constructor (private readonly db: PrismaClient) {}

  async like (userId: string, postId: string): Promise<void> {
    await this.db.reaction.create({
      data: {
        userId,
        postId,
        type: ReactionEnum.LIKE
      }
    })
  }

  async retweet (userId: string, postId: string): Promise<void> {
    await this.db.reaction.create({
      data: {
        userId,
        postId,
        type: ReactionEnum.RETWEET
      }
    })
  }

  async unretweet (userId: string, postId: string): Promise<void> {
    await this.db.reaction.deleteMany({
      where: {
        userId,
        postId,
        type: ReactionEnum.RETWEET
      }
    })
  }

  async dislike (userId: string, postId: string): Promise<void> {
    await this.db.reaction.deleteMany({
      where: {
        userId,
        postId,
        type: ReactionEnum.LIKE
      }
    })
  }

  async checkLike (userId: string, postId: string): Promise<boolean> {
    const reaction = await this.db.reaction.findFirst({
      where: {
        userId,
        postId,
        type: ReactionEnum.LIKE
      }
    })

    return reaction !== null
  }

  async checkRetweet (userId: string, postId: string): Promise<boolean> {
    const reaction = await this.db.reaction.findFirst({
      where: {
        userId,
        postId,
        type: ReactionEnum.RETWEET
      }
    })

    return reaction !== null
  }

  async getLikes (userId: string): Promise<ReactionDTO[]> {
    const reactions = await this.db.reaction.findMany({
      where: {
        userId,
        type: ReactionEnum.LIKE
      }
    })

    return reactions.map(reaction => new ReactionDTO(reaction))
  }

  async getRetweets (userId: string): Promise<ReactionDTO[]> {
    const reactions = await this.db.reaction.findMany({
      where: {
        userId,
        type: ReactionEnum.RETWEET
      }
    })

    return reactions.map(reaction => new ReactionDTO(reaction))
  }
}
