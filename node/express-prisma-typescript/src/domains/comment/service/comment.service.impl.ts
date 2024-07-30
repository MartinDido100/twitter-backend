import { CreatePostInputDTO } from '@domains/post/dto'
import { CommentDTO, ExtendedCommentDTO } from '../dto'
import { CommentService } from '.'
import { CommentRepository } from '../repository'
import { CursorPagination } from '@types'
import { NotFoundException, ForbiddenException, BucketManager } from '@utils'
import { FollowRepository } from '@domains/follow/repository'
import { UserRepository } from '@domains/user/repository'
import { PostRepository } from '@domains/post/repository'

export class CommentServiceImpl implements CommentService {
  constructor (private readonly repository: CommentRepository,
    private readonly followRepo: FollowRepository,
    private readonly userRepo: UserRepository,
    private readonly postRepo: PostRepository,
    private readonly bucketManager: BucketManager) {}

  private async validateAccesibility (userId: string, otherUserId: string): Promise<boolean> {
    const isFollowing = await this.followRepo.checkFollow(userId, otherUserId)
    const isPrivate = await this.userRepo.isPrivateUser(otherUserId)

    return !isPrivate || isFollowing || userId === otherUserId
  }

  private async generatePutImagesUrls (images: string[]): Promise<string[]> {
    if (!images.length) return []
    return await Promise.all(images.map(async image => await this.bucketManager.putImage(image)))
  }

  private async getImagesUrls (images: string[]): Promise<string[]> {
    if (!images.length) return []
    return await Promise.all(images.map(async image => await this.bucketManager.getImage(image)))
  }

  async commentPost (userId: string, postId: string, body: CreatePostInputDTO): Promise<CommentDTO> {
    const post = await this.postRepo.getById(postId)
    if (!post) throw new NotFoundException('post')

    const accesiblePost = await this.validateAccesibility(userId, post.authorId)

    if (!accesiblePost) throw new ForbiddenException()

    const newComment = await this.repository.commentPost(userId, postId, body)
    newComment.images = await this.generatePutImagesUrls(newComment.images)

    return newComment
  }

  async getCommentsByUser (loggedUserId: string, userId: string): Promise<ExtendedCommentDTO[]> {
    const user = await this.userRepo.getById(userId)
    if (!user) throw new NotFoundException('user')
    const accesibleUser = await this.validateAccesibility(loggedUserId, userId)
    if (!accesibleUser) throw new ForbiddenException()

    const comments = await this.repository.getCommentsByUser(userId)

    for (const comment of comments) {
      comment.images = await this.getImagesUrls(comment.images)
    }

    return comments
  }

  async getCommentsByPost (userId: string, postId: string, options: CursorPagination): Promise<ExtendedCommentDTO[]> {
    const post = await this.postRepo.getById(postId)
    if (!post) throw new NotFoundException('post')
    const accesibleUser = await this.validateAccesibility(userId, post.authorId)
    if (!accesibleUser) throw new ForbiddenException()
    const comments = await this.repository.getCommentsByPost(postId, options)

    for (const comment of comments) {
      comment.images = await this.getImagesUrls(comment.images)
      comment.author.profilePicture = comment.author.profilePicture ? await this.bucketManager.getImage(comment.author.profilePicture) : null
    }

    return comments
  }
}
