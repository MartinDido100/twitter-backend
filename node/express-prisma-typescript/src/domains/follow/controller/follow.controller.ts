import { Request, Response, Router } from 'express';
import { FollowServiceImpl } from '../service';
import { FollowRepositoryImpl } from '../repository';
import { db } from '@utils';
import HttpStatus from 'http-status';

import 'express-async-errors';

export const followerRouter = Router();

const service = new FollowServiceImpl(new FollowRepositoryImpl(db));

/**
 * @openapi
 *
 * /follower/follow/{userId}:
 *   post:
 *     summary: Follows the given user.
 *     tags:
 *       - Follows
 *     security:
 *       - auth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         description: The id of the user to follow.
 *     responses:
 *       201:
 *         description: User successfully followed.
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               example: "Followed"
 *       409:
 *         description: Returns an error if the logged user is already following the given user or if the user tries to follow themselves.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Conflict"
 *                 error_code:
 *                   type: string
 *                   example: "USER_ALREADY_FOLLOWED"
 *       401:
 *         description: Returns an error if the user is not authenticated.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Unauthorized. You must login to access this content."
 *
 */
followerRouter.post('/follow/:userId', async (req: Request, res: Response) => {
  const { userId } = res.locals.context;
  const { userId: followUserId } = req.params;

  await service.followUser(userId, followUserId);
  res.status(HttpStatus.CREATED).send('Followed');
});

/**
 * @openapi
 *
 * /follower/unfollow/{userId}:
 *   post:
 *     summary: Unfollows the given user.
 *     tags:
 *       - Follows
 *     security:
 *       - auth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         description: The id of the user to unfollow.
 *     responses:
 *       201:
 *         description: User successfully unfollowed.
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               example: "Unfollowed"
 *       409:
 *         description: Returns an error if the logged user is not following the given user or if the user tries to unfollow themselves.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Conflict"
 *                 error_code:
 *                   type: string
 *                   example: "USER_ALREADY_FOLLOWED"
 *       401:
 *         description: Returns an error if the user is not authenticated.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Unauthorized. You must login to access this content."
 */
followerRouter.post('/unfollow/:userId', async (req: Request, res: Response) => {
  const { userId } = res.locals.context;
  const { userId: followUserId } = req.params;
  await service.unfollowUser(userId, followUserId);
  res.status(HttpStatus.CREATED).send('Unfollowed');
});
