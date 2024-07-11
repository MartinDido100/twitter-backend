import { CreatePostInputDTO, PostDTO } from '../dto'
import { PostRepository } from '../repository'
import { PostService } from '.'
import { validate } from 'class-validator'
import { ForbiddenException, NotFoundException, UnauthorizedProfileException } from '@utils'
import { CursorPagination } from '@types'
import { FollowRepository } from '@domains/follow/repository'
import { UserRepository } from '@domains/user/repository'

export class PostServiceImpl implements PostService {
  constructor (private readonly repository: PostRepository
    , private readonly followRepo: FollowRepository
    , private readonly userRepo: UserRepository) {}

  async createPost (userId: string, data: CreatePostInputDTO): Promise<PostDTO> {
    await validate(data)
    return await this.repository.create(userId, data)
  }

  async deletePost (userId: string, postId: string): Promise<void> {
    const post = await this.repository.getById(postId)
    if (!post) throw new NotFoundException('post')
    if (post.authorId !== userId) throw new ForbiddenException()
    await this.repository.delete(postId)
  }

  async getPost (userId: string, postId: string): Promise<PostDTO> {
    // TODO: validate that the author has public profile or the user follows the author (DONE)
    const post = await this.repository.getById(postId)
    if (!post) throw new NotFoundException('post')
    const isFollowing = await this.followRepo.checkFollow(userId, post.authorId)
    const isPrivate = await this.userRepo.idPrivateUser(post.authorId)
    if (isPrivate || !isFollowing) throw new UnauthorizedProfileException()

    return post
  }

  async getLatestPosts (userId: string, options: CursorPagination): Promise<PostDTO[]> {
    // TODO: filter post search to return posts from authors that the user follows (DONE)
    return await this.repository.getAllByDatePaginated(options, userId)
  }

  async getPostsByAuthor (userId: any, authorId: string): Promise<PostDTO[]> {
    // TODO: throw exception when the author has a private profile and the user doesn't follow them (DONE)
    const isFollowing = await this.followRepo.checkFollow(userId, authorId)
    const isPrivate = await this.userRepo.idPrivateUser(authorId)
    console.log(isFollowing, isPrivate)
    if (isPrivate || !isFollowing) throw new UnauthorizedProfileException()
    return await this.repository.getByAuthorId(authorId)
  }
}
