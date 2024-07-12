import { CreatePostInputDTO } from '@domains/post/dto'
import { CommentDTO } from '../dto'
import { CursorPagination } from '@types'

export interface CommentService {
  commentPost: (userId: string, postId: string, data: CreatePostInputDTO) => Promise<CommentDTO>
  getCommentsByUser: (userId: string) => Promise<CommentDTO[]>
  getCommentsByPost: (postId: string, option: CursorPagination) => Promise<CommentDTO[]>
}
