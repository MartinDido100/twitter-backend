import { ReactionRepository } from '../repository'
import { ReactionService } from '.'
import { ConflictException, NotFoundException } from '@utils'
import { ReactionDTO, ReactionEnum } from '../dto'
import { UserRepository } from '../../user/repository/user.repository'
import { FollowRepository } from '@domains/follow'
import { PostRepository } from '@domains/post/repository'

export class ReactionServiceImpl implements ReactionService {
  constructor (
    private readonly reactionRepository: ReactionRepository,
    private readonly userRepository: UserRepository,
    private readonly followRepo: FollowRepository,
    private readonly postRepo: PostRepository
  ) {}

  private async accesiblePost (loggedId: string, userId: string): Promise<boolean> {
    const isFollowing = await this.followRepo.checkFollow(loggedId, userId)
    const isPrivate = await this.userRepository.isPrivateUser(userId)
    return !isPrivate || isFollowing || loggedId === userId
  }

  async getLikes (userId: string): Promise<ReactionDTO[]> {
    const user = await this.userRepository.getById(userId)

    if (!user) throw new NotFoundException('user')

    return await this.reactionRepository.getLikes(userId)
  }

  async getRetweets (userId: string): Promise<ReactionDTO[]> {
    const user = await this.userRepository.getById(userId)

    if (!user) throw new NotFoundException('user')

    return await this.reactionRepository.getRetweets(userId)
  }

  async deleteReaction (userId: string, postId: string, type: ReactionEnum): Promise <void> {
    const post = await this.postRepo.getById(postId)

    if (!post) {
      throw new NotFoundException('post')
    }

    const accesible = await this.accesiblePost(userId, post.authorId)

    if (!accesible) {
      throw new NotFoundException('post')
    }

    const reacted = await this.reactionRepository.checkReaction(userId, postId, type)

    if (!reacted) {
      throw new ConflictException(`${type}_NOT_EXISTS`)
    }

    await this.reactionRepository.deleteReaction(userId, postId, type)
  }

  async reactToPost (userId: string, postId: string, type: ReactionEnum): Promise<void> {
    const post = await this.postRepo.getById(postId)

    if (!post) {
      throw new NotFoundException('post')
    }

    const accesible = await this.accesiblePost(userId, post.authorId)

    if (!accesible) {
      throw new NotFoundException('post')
    }

    const reacted = await this.reactionRepository.checkReaction(userId, postId, type)

    if (reacted) {
      throw new ConflictException(`${type}_ALREADY_EXISTS`)
    }

    await this.reactionRepository.reactToPost(userId, postId, type)
  }
}
