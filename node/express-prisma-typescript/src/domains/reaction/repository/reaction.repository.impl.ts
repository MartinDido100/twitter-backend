import { PrismaClient } from '@prisma/client'
import { ReactionRepository } from './reaction.repository'
import { ReactionDTO, ReactionEnum } from '../dto'

export class ReactionRepositoryImpl implements ReactionRepository {
  constructor (private readonly db: PrismaClient) {}

  async checkReaction (userId: string, postId: string, type: ReactionEnum): Promise<boolean> {
    const reaction = await this.db.reaction.findFirst({
      where: {
        type,
        userId,
        postId
      }
    })

    return reaction !== null
  }

  async reactToPost (userId: string, postId: string, type: ReactionEnum): Promise<void> {
    await this.db.reaction.create({
      data: {
        userId,
        postId,
        type
      }
    })
  }

  async deleteReaction (userId: string, postId: string, type: ReactionEnum): Promise<void> {
    await this.db.reaction.deleteMany({
      where: {
        userId,
        postId,
        type
      }
    })
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
