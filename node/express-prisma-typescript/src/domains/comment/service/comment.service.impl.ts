import { CreatePostInputDTO } from '@domains/post/dto'
import { CommentDTO } from '../dto'
import { CommentService } from '.'
import { CommentRepository } from '../repository'

export class CommentServiceImpl implements CommentService {
  constructor (private readonly repository: CommentRepository) {}

  async commentPost (userId: string, postId: string, body: CreatePostInputDTO): Promise<CommentDTO> {
    return await this.repository.commentPost(userId, postId, body)
  }

  async getCommentsByUser (userId: string): Promise<CommentDTO[]> {
    return await this.repository.getCommentsByUser(userId)
  }
}
