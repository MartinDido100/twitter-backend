import { CreatePostInputDTO, ExtendedPostDTO, PostDTO } from '../dto'
import { PostRepository } from '../repository'
import { PostService } from '.'
import { ForbiddenException, NotFoundException } from '@utils'
import { CursorPagination } from '@types'
import { FollowRepository } from '@domains/follow/repository'
import { UserRepository } from '@domains/user/repository'
import { BucketManager } from '@utils/s3bucket'

export class PostServiceImpl implements PostService {
  constructor (private readonly repository: PostRepository
    , private readonly followRepo: FollowRepository
    , private readonly userRepo: UserRepository
    , private readonly bucketManager: BucketManager) {}

  private async validateAuthor (userId: string, authorId: string): Promise<boolean> {
    const isFollowing = await this.followRepo.checkFollow(userId, authorId)
    const isPrivate = await this.userRepo.isPrivateUser(authorId)

    return !isPrivate || isFollowing || userId === authorId
  }

  private async generatePutImagesUrls (images: string[]): Promise<string[]> {
    if (!images.length) return []
    return await Promise.all(images.map(async image => await this.bucketManager.putImage(image)))
  }

  private async getImagesUrls (images: string[]): Promise<string[]> {
    if (!images.length) return []
    return await Promise.all(images.map(async image => await this.bucketManager.getImage(image)))
  }

  async createPost (userId: string, data: CreatePostInputDTO): Promise<PostDTO> {
    const newPost = await this.repository.create(userId, data)

    newPost.images = await this.generatePutImagesUrls(newPost.images)

    return newPost
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

    const accesiblePost = await this.validateAuthor(userId, post.authorId)
    if (!accesiblePost) throw new NotFoundException('post')

    post.images = await this.getImagesUrls(post.images)

    return post
  }

  async getLatestPosts (userId: string, options: CursorPagination): Promise<ExtendedPostDTO[]> {
    // TODO: filter post search to return posts from authors that the user follows (DONE)
    const posts = await this.repository.getAllByDatePaginated(options, userId)

    for (const post of posts) {
      post.images = await this.getImagesUrls(post.images)
      post.author.profilePicture = post.author.profilePicture ? await this.bucketManager.getImage(post.author.profilePicture) : null
    }

    return posts
  }

  async getPostsByAuthor (userId: any, authorId: string): Promise<ExtendedPostDTO[]> {
    // TODO: throw exception when the author has a private profile and the user doesn't follow them (DONE)
    const accesibleAuthor = await this.validateAuthor(userId, authorId)
    if (!accesibleAuthor) throw new NotFoundException('post')

    const posts = await this.repository.getByAuthorId(authorId)

    for (const post of posts) {
      post.images = await this.getImagesUrls(post.images)
      post.author.profilePicture = post.author.profilePicture ? await this.bucketManager.getImage(post.author.profilePicture) : null
    }

    return posts
  }
}
