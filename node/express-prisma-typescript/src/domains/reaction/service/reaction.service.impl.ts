import { ReactionRepository } from '../repository'
import { ReactionService } from '.'
import { ConflictException } from '@utils'
import { ReactionDTO, ReactionEnum } from '../dto'

export class ReactionServiceImpl implements ReactionService {
  constructor (private readonly reactionRepository: ReactionRepository) {}
  async getLikes (userId: string): Promise<ReactionDTO[]> {
    return await this.reactionRepository.getLikes(userId)
  }

  async getRetweets (userId: string): Promise<ReactionDTO[]> {
    return await this.reactionRepository.getRetweets(userId)
  }

  async deleteReaction (userId: string, postId: string, type: ReactionEnum): Promise <void> {
    const reacted = await this.reactionRepository.checkReaction(userId, postId, type)

    if (!reacted) {
      throw new ConflictException(`${type}_NOT_EXISTS`)
    }

    await this.reactionRepository.deleteReaction(userId, postId, type)
  }

  async reactToPost (userId: string, postId: string, type: ReactionEnum): Promise<void> {
    const reacted = await this.reactionRepository.checkReaction(userId, postId, type)

    if (reacted) {
      throw new ConflictException(`${type}_ALREADY_EXISTS`)
    }

    await this.reactionRepository.reactToPost(userId, postId, type)
  }
}
