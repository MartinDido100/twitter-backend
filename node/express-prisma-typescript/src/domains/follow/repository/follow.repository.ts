
export interface FollowRepository {
  followUser: (followerId: string, followedId: string) => Promise<void>
  unfollowUser: (userId: string, unfollowUserId: string) => Promise<void>
  checkFollow: (userId: string, followUserId: string) => Promise<boolean>
}
