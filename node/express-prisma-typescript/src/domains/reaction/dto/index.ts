export enum ReactionEnum {
  LIKE = 'LIKE',
  RETWEET = 'RETWEET'
}

type ReactionType = 'LIKE' | 'RETWEET'

export class ReactionDTO {
  constructor (reaction: ReactionDTO) {
    this.id = reaction.id
    this.userId = reaction.userId
    this.postId = reaction.postId
    this.type = reaction.type
  }

  id: string
  userId: string
  postId: string
  type: ReactionType
}
