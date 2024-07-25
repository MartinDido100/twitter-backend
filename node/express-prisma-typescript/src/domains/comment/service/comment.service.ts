import { CreatePostInputDTO } from '@domains/post/dto'
import { CommentDTO } from '../dto'
import { CursorPagination } from '@types'

export interface CommentService {
  commentPost: (userId: string, postId: string, data: CreatePostInputDTO) => Promise<CommentDTO>
  getCommentsByUser: (loggedUserId: string, userId: string) => Promise<CommentDTO[]>
  getCommentsByPost: (userId: string, postId: string, option: CursorPagination) => Promise<CommentDTO[]>
}
