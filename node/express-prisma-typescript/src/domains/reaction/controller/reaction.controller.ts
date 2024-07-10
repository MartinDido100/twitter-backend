import { db } from "@utils";
import { Request, Response, Router } from "express";
import { ReactionServiceImpl } from "../service";
import { ReactionRepositoryImpl } from "../repository";
import httpStatus from "http-status";


export const reactionRouter = Router();

const reactionService = new ReactionServiceImpl(new ReactionRepositoryImpl(db));

reactionRouter.post("/like/:postId", async (req: Request, res: Response) => {
    const { userId } = res.locals.context;
    const { postId } = req.params;

    await reactionService.like(userId, postId);
    res.status(httpStatus.CREATED).send('Liked');
});

reactionRouter.delete("/like/:postId", async (req: Request, res: Response) => {
    const { userId } = res.locals.context;
    const { postId } = req.params;

    await reactionService.dislike(userId, postId);
    res.status(httpStatus.CREATED).send('Disliked');
});

reactionRouter.post("/retweet/:postId", async (req: Request, res: Response) => {
    const { userId } = res.locals.context;
    const { postId } = req.params;

    await reactionService.retweet(userId, postId);
    res.status(httpStatus.CREATED).send('Retweeted');
});

reactionRouter.delete("/retweet/:postId", async (req: Request, res: Response) => {
    const { userId } = res.locals.context;
    const { postId } = req.params;

    await reactionService.like(userId, postId);
    res.status(httpStatus.CREATED).send('Unretweeted');
});