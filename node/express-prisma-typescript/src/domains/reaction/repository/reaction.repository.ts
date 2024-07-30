import { ReactionDTO, ReactionEnum } from '../dto'

export interface ReactionRepository {
  getLikes: (userId: string) => Promise<ReactionDTO[]>
  getRetweets: (userId: string) => Promise<ReactionDTO[]>
  reactToPost: (userId: string, postId: string, type: ReactionEnum) => Promise<void>
  deleteReaction: (userId: string, postId: string, type: ReactionEnum) => Promise<void>
  checkReaction: (userId: string, postId: string, type: ReactionEnum) => Promise<boolean>
}
