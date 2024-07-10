import { ReactionRepository } from "../repository";
import { ReactionService } from ".";
import { ConflictException } from "@utils";

export class ReactionServiceImpl implements ReactionService {
    constructor(private readonly reactionRepository: ReactionRepository) {}

    async like(userId: string, postId: string): Promise<void> {
        const liked = await this.reactionRepository.checkLike(userId, postId);

        if (liked) {
            throw new ConflictException('ALREADY_LIKED');
        }

        await this.reactionRepository.like(userId, postId);
    }

    async retweet(userId: string, postId: string): Promise<void> {
        const retweeted = await this.reactionRepository.checkLike(userId, postId);

        if (retweeted) {
            throw new ConflictException('ALREADY_RETWEETED');
        }

        await this.reactionRepository.retweet(userId, postId);
    }

    async unretweet(userId: string, postId: string): Promise<void> {
        const retweeted = await this.reactionRepository.checkLike(userId, postId);

        if (!retweeted) {
            throw new ConflictException('NOT_RETWEETED');
        }

        await this.reactionRepository.unretweet(userId, postId);
    }

    async dislike(userId: string, postId: string): Promise<void> {
        const liked = await this.reactionRepository.checkLike(userId, postId);

        if (!liked) {
            throw new ConflictException('NOT_LIKED');
        }

        await this.reactionRepository.dislike(userId, postId);
    }
}