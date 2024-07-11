import { ReactionDTO } from '../dto'

export interface ReactionService {
  like: (userId: string, postId: string) => Promise<void>
  retweet: (userId: string, postId: string) => Promise<void>
  unretweet: (userId: string, postId: string) => Promise<void>
  dislike: (userId: string, postId: string) => Promise<void>
  getLikes: (userId: string) => Promise<ReactionDTO[]>
  getRetweets: (userId: string) => Promise<ReactionDTO[]>
}
