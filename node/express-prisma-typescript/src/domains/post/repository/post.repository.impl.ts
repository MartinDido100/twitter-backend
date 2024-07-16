import { PrismaClient } from '@prisma/client'

import { CursorPagination } from '@types'

import { PostRepository } from '.'
import { CreatePostInputDTO, PostDTO } from '../dto'
import { PostEnum } from '../types'

export class PostRepositoryImpl implements PostRepository {
  constructor (private readonly db: PrismaClient) {}

  async create (userId: string, data: CreatePostInputDTO): Promise<PostDTO> {
    const post = await this.db.post.create({
      data: {
        authorId: userId,
        postType: PostEnum.POST,
        ...data,
        images: data.images?.map((image, index) => `postImages/${userId}/${Date.now()}${index}${image}`)
      }
    })

    return new PostDTO(post)
  }

  async getAllByDatePaginated (options: CursorPagination, userId: string): Promise<PostDTO[]> {
    const posts = await this.db.post.findMany({
      cursor: options.after ? { id: options.after } : options.before ? { id: options.before } : undefined,
      skip: options.after ?? options.before ? 1 : undefined,
      take: options.limit ? (options.before ? -options.limit : options.limit) : undefined,
      orderBy: [
        {
          createdAt: 'desc'
        },
        {
          id: 'asc'
        }
      ],
      where: {
        AND: [
          {
            OR: [
              {
                author: {
                  isPrivate: false
                }
              },
              {
                author: {
                  isPrivate: true,
                  followers: {
                    some: {
                      followerId: userId
                    }
                  }
                }
              }
            ]
          },
          {
            postType: PostEnum.POST
          }
        ]
      }
    })
    return posts.map((post) => new PostDTO(post))
  }

  async delete (postId: string): Promise<void> {
    await this.db.post.delete({
      where: {
        id: postId
      }
    })
  }

  async getById (postId: string): Promise<PostDTO | null> {
    const post = await this.db.post.findUnique({
      where: {
        id: postId
      }
    })
    return post != null ? new PostDTO(post) : null
  }

  async getByAuthorId (authorId: string): Promise<PostDTO[]> {
    const posts = await this.db.post.findMany({
      where: {
        authorId
      }
    })
    return posts.map((post) => new PostDTO(post))
  }
}
