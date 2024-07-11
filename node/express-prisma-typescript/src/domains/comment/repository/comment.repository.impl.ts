import { PrismaClient } from '@prisma/client'
import { CommentDTO } from '../dto'
import { CommentRepository } from '.'
import { CreatePostInputDTO } from '@domains/post/dto'
import { PostEnum } from '@domains/post/types'

export class CommentRepositoryImpl implements CommentRepository {
  constructor (private readonly db: PrismaClient) {}

  async commentPost (userId: string, postId: string, data: CreatePostInputDTO): Promise<CommentDTO> {
    const comment = await this.db.post.create({
      data: {
        authorId: userId,
        postType: PostEnum.COMMENT,
        parentId: postId,
        ...data
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
}
