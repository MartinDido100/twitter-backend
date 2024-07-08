export interface FollowService {
  followUser: (userId: string, followUserId: string) => Promise<void>
  unfollowUser: (userId: string, unfollowUserId: string) => Promise<void>
}
