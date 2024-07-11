import { CreatePostInputDTO } from '@domains/post/dto'
import { CommentDTO } from '../dto'

export interface CommentService {
  commentPost: (userId: string, postId: string, data: CreatePostInputDTO) => Promise<CommentDTO>
  getCommentsByUser: (userId: string) => Promise<CommentDTO[]>
}
