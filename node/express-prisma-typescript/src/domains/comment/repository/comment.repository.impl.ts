import { PrismaClient } from '@prisma/client'
import { CommentDTO, ExtendedCommentDTO } from '../dto'
import { CommentRepository } from '.'
import { CreatePostInputDTO } from '@domains/post/dto'
import { PostEnum } from '@domains/post/types'
import { CursorPagination } from '@types'
import { ReactionEnum } from '@domains/reaction/dto'

export class CommentRepositoryImpl implements CommentRepository {
  constructor (private readonly db: PrismaClient) {}

  async commentPost (userId: string, postId: string, data: CreatePostInputDTO): Promise<CommentDTO> {
    const comment = await this.db.post.create({
      data: {
        authorId: userId,
        postType: PostEnum.COMMENT,
        parentId: postId,
        ...data,
        images: data.images?.map((image, index) => `postImages/${userId}/${Date.now()}${index}${image}`)
      }
    })
    return new CommentDTO(comment)
  }

  async getCommentsByUser (userId: string): Promise<CommentDTO[]> {
    const comments = await this.db.post.findMany({
      where: {
        authorId: userId,
        postType: PostEnum.COMMENT
      }
    })

    return comments.map((comment) => new CommentDTO(comment))
  }

  async getCommentsByPost (postId: string, options: CursorPagination): Promise<ExtendedCommentDTO[]> {
    const comments = await this.db.post.findMany({
      cursor: options.after ? { id: options.after } : options.before ? { id: options.before } : undefined,
      skip: options.after ?? options.before ? 1 : undefined,
      take: options.limit ? (options.before ? -options.limit : options.limit) : undefined,
      where: {
        parentId: postId,
        postType: PostEnum.COMMENT
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
        }
      },
      orderBy: [
        {
          reactions: {
            _count: 'desc'
          }
        },
        {
          id: 'asc'
        }
      ]
    })
    return comments.map((comment) => {
      const qtyLikes = comment.reactions.filter((reaction) => reaction.type === ReactionEnum.LIKE).length
      const qtyRetweets = comment.reactions.filter((reaction) => reaction.type === ReactionEnum.RETWEET).length
      return new ExtendedCommentDTO({ ...comment, qtyLikes, qtyRetweets })
    })
  }
}
