import { PostDTO } from '@domains/post/dto'

export class CommentDTO extends PostDTO {
  constructor (comment: CommentDTO) {
    super(comment)
    this.parentId = comment.parentId
  }

  parentId!: string | null
}
