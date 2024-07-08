
export interface FollowRepository {
  followUser: (userId: string, followUserId: string) => Promise<void>
  unfollowUser: (userId: string, unfollowUserId: string) => Promise<void>
  checkFollow: (userId: string, followUserId: string) => Promise<boolean>
}
