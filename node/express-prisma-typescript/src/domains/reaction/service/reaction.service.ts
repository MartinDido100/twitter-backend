export interface ReactionService {
    like(userId: string, postId: string): Promise<void>;
    retweet(userId: string, postId: string): Promise<void>;
    unretweet(userId: string, postId: string): Promise<void>;
    dislike(userId: string, postId: string): Promise<void>;
}