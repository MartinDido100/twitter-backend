import { PostDTO } from '@domains/post/dto'
import { UserViewDTO } from '@domains/user/dto'

export class CommentDTO extends PostDTO {
  constructor (comment: CommentDTO) {
    super(comment)
    this.parentId = comment.parentId
  }

  parentId!: string | null
}

export class ExtendedCommentDTO extends CommentDTO {
  constructor (comment: ExtendedCommentDTO) {
    super(comment)
    this.qtyLikes = comment.qtyLikes
    this.qtyRetweets = comment.qtyRetweets
    this.author = comment.author
  }

  qtyLikes!: number
  qtyRetweets!: number
  author!: UserViewDTO
}
