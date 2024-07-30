import { ReactionDTO, ReactionEnum } from '../dto'

export interface ReactionService {
  reactToPost: (userId: string, postId: string, type: ReactionEnum) => Promise<void>
  deleteReaction: (userId: string, postId: string, type: ReactionEnum) => Promise <void>
  getLikes: (userId: string) => Promise<ReactionDTO[]>
  getRetweets: (userId: string) => Promise<ReactionDTO[]>
}
