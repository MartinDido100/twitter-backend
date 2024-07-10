import { PrismaClient } from "@prisma/client";
import { ReactionRepository } from "./reaction.repository";
import { ReactionEnum } from "../types";


export class ReactionRepositoryImpl implements ReactionRepository{

    constructor(private readonly db: PrismaClient){}

    async like(userId: string, postId: string): Promise<void> {
        await this.db.reaction.create({
            data: {
                userId,
                postId,
                type: ReactionEnum.LIKE
            }
        })
    }

    async retweet(userId: string, postId: string): Promise<void> {
        await this.db.reaction.create({
            data: {
                userId,
                postId,
                type: ReactionEnum.RETWEET
            }
        })
    }

    async unretweet(userId: string, postId: string): Promise<void> {
        await this.db.reaction.deleteMany({
            where: {
                userId,
                postId,
                type: ReactionEnum.RETWEET
            }
        })
    }

    async dislike(userId: string, postId: string): Promise<void> {
        await this.db.reaction.deleteMany({
            where: {
                userId,
                postId,
                type: ReactionEnum.LIKE
            }
        })
    }

    async checkLike(userId: string, postId: string): Promise<boolean> {
        const reaction = await this.db.reaction.findFirst({
            where: {
                userId,
                postId,
                type: ReactionEnum.LIKE
            }
        })

        return reaction !== null;
    }

    async checkRetweet(userId: string, postId: string): Promise<boolean> {
        const reaction = await this.db.reaction.findFirst({
            where: {
                userId,
                postId,
                type: ReactionEnum.RETWEET
            }
        })

        return reaction !== null;
    }

}