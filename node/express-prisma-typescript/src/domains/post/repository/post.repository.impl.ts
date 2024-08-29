import { PrismaClient } from '@prisma/client'

import { CursorPagination } from '@types'

import { PostRepository } from '.'
import { CreatePostInputDTO, ExtendedPostDTO, PostDTO, PostEnum } from '../dto'
import { ReactionEnum } from '@domains/reaction/dto'

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

  async getAllByDatePaginated (options: CursorPagination, userId: string): Promise<ExtendedPostDTO[]> {
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
      include: {
        reactions: true,
        author: {
          select: {
            id: true,
            name: true,
            username: true,
            profilePicture: true
          },
        },
        comments: true
      },
      where: {
        AND: [
          {
            OR: [
              {
                authorId: userId
              },
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

    console.log(posts)
    return posts.map((post) => {
      const qtyLikes = post.reactions.filter((reaction) => reaction.type === ReactionEnum.LIKE).length
      const qtyRetweets = post.reactions.filter((reaction) => reaction.type === ReactionEnum.RETWEET).length
      const qtyComments = post.comments.length
      return new ExtendedPostDTO({ ...post, qtyLikes, qtyRetweets, qtyComments, reactions: post.reactions })
    })
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
      },
      include: {
        reactions: true,
        author: {
          select: {
            id: true,
            name: true,
            username: true,
            profilePicture: true
          }
        },
        comments: true
      }
    })
    return post != null
      ? new ExtendedPostDTO({
        ...post,
        qtyComments: post.comments.length,
        qtyLikes: post.reactions.filter((reaction) => reaction.type === ReactionEnum.LIKE).length,
        qtyRetweets: post.reactions.filter((reaction) => reaction.type === ReactionEnum.RETWEET).length,
        reactions: post.reactions
      })
      : null
  }

  async getByAuthorId (authorId: string): Promise<ExtendedPostDTO[]> {
    const posts = await this.db.post.findMany({
      where: {
        authorId
      },
      include: {
        reactions: true,
        comments: true,
        author: {
          select: {
            id: true,
            name: true,
            username: true,
            profilePicture: true
          }
        }
      }
    })

    return posts.map((post) => {
      const qtyLikes = post.reactions.filter((reaction) => reaction.type === ReactionEnum.LIKE).length
      const qtyRetweets = post.reactions.filter((reaction) => reaction.type === ReactionEnum.RETWEET).length
      const qtyComments = post.comments.length

      return new ExtendedPostDTO({ ...post, qtyLikes, qtyRetweets, qtyComments })
    })
  }
}
