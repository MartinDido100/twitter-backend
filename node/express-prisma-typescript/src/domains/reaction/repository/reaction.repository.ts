import { ReactionDTO } from '../dto'

export interface ReactionRepository {
  like: (userId: string, postId: string) => Promise<void>
  dislike: (userId: string, postId: string) => Promise<void>
  checkLike: (userId: string, postId: string) => Promise<boolean>
  checkRetweet: (userId: string, postId: string) => Promise<boolean>
  retweet: (userId: string, postId: string) => Promise<void>
  unretweet: (userId: string, postId: string) => Promise<void>
  getLikes: (userId: string) => Promise<ReactionDTO[]>
  getRetweets: (userId: string) => Promise<ReactionDTO[]>
}
