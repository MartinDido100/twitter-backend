import { CreatePostInputDTO } from '@domains/post/dto'
import { CommentDTO } from '../dto'
import { CommentService } from '.'
import { CommentRepository } from '../repository'
import { CursorPagination } from '@types'
import { NotFoundException, ForbiddenException } from '@utils'
import { FollowRepository } from '@domains/follow/repository'
import { UserRepository } from '@domains/user/repository'
import { PostRepository } from '@domains/post/repository'

export class CommentServiceImpl implements CommentService {
  constructor (private readonly repository: CommentRepository,
    private readonly followRepo: FollowRepository,
    private readonly userRepo: UserRepository,
    private readonly postRepo: PostRepository) {}

  private async validateAccesibility (userId: string, otherUserId: string): Promise<boolean> {
    const isFollowing = await this.followRepo.checkFollow(userId, otherUserId)
    const isPrivate = await this.userRepo.isPrivateUser(otherUserId)

    return !isPrivate || isFollowing
  }

  async commentPost (userId: string, postId: string, body: CreatePostInputDTO): Promise<CommentDTO> {
    const post = await this.postRepo.getById(postId)
    if (!post) throw new NotFoundException('post')

    const accesiblePost = await this.validateAccesibility(userId, post.authorId)

    if (!accesiblePost) throw new ForbiddenException()

    return await this.repository.commentPost(userId, postId, body)
  }

  async getCommentsByUser (loggedUserId: string, userId: string): Promise<CommentDTO[]> {
    const user = await this.userRepo.getById(userId)
    if (!user) throw new NotFoundException('user')
    const accesibleUser = await this.validateAccesibility(loggedUserId, userId)
    if (!accesibleUser) throw new ForbiddenException()
    return await this.repository.getCommentsByUser(userId)
  }

  async getCommentsByPost (userId: string, postId: string, options: CursorPagination): Promise<CommentDTO[]> {
    const post = await this.postRepo.getById(postId)
    if (!post) throw new NotFoundException('post')
    const accesibleUser = await this.validateAccesibility(userId, post.authorId)
    if (!accesibleUser) throw new ForbiddenException()
    return await this.repository.getCommentsByPost(postId, options)
  }
}
