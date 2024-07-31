import { db, QueryException } from '@utils'
import { Request, Response, Router } from 'express'
import { ReactionServiceImpl } from '../service'
import { ReactionRepositoryImpl } from '../repository'
import httpStatus from 'http-status'

import 'express-async-errors'
import { ReactionEnum } from '../dto'
import { UserRepositoryImpl } from '@domains/user/repository'
import { FollowRepositoryImpl } from '@domains/follow'
import { PostRepositoryImpl } from '@domains/post/repository'

export const reactionRouter = Router()

const reactionService = new ReactionServiceImpl(
  new ReactionRepositoryImpl(db),
  new UserRepositoryImpl(db),
  new FollowRepositoryImpl(db),
  new PostRepositoryImpl(db)
)

/**
 * @openapi
 * components:
 *   schemas:
 *     Reaction:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: "aa649330-d933-40df-b029-12c5a60a041d"
 *           description: "Reaction ID"
 *         userId:
 *           type: string
 *           example: "aa649330-d933-40df-b029-12c5a60a041d"
 *           description: "Id of user that reacted"
 *         postId:
 *           type: string
 *           description: "Id of post that was reacted"
 *           example: "aa649330-d933-40df-b029-12c5a60a041d"
 *         type:
 *           type: string
 *           description: "Reaction type (Like or Retweet)"
 *           example: LIKE or RETWEET
 */

/**
 * @openapi
 *
 * /reaction/likes/{userId}:
 *   get:
 *     summary: Get all the likes of the given user.
 *     tags:
 *       - Reactions
 *     security:
 *       - auth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         description: The id of the user to get the likes.
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Returns an array of likes.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Reaction'
 *       404:
 *         description: Returns an error if user was not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Not found. Couldn't find user"
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
reactionRouter.get('/likes/:userId', async (req: Request, res: Response) => {
  const { userId } = req.params

  const likes = await reactionService.getLikes(userId)
  res.status(httpStatus.OK).json(likes)
})

/**
 * @openapi
 *
 * /reaction/retweets/{userId}:
 *   get:
 *     summary: Get all the retweets of the given user.
 *     tags:
 *       - Reactions
 *     security:
 *       - auth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         description: The id of the user to get the retweets.
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Returns an array of retweets.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Reaction'
 *       404:
 *         description: Returns an error if user was not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Not found. Couldn't find user"
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
reactionRouter.get('/retweets/:userId', async (req: Request, res: Response) => {
  const { userId } = req.params

  const retweets = await reactionService.getRetweets(userId)
  res.status(httpStatus.OK).json(retweets)
})

/**
 * @openapi
 *
 * /reaction/{postId}:
 *   post:
 *     summary: Reacts to a post.
 *     tags:
 *       - Reactions
 *     security:
 *       - auth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         description: The id of the post to react.
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: type
 *         description: Reaction type, must be like or retweet.
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       201:
 *         description: Post reacted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               example: "Reacted successfully"
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
 *       404:
 *         description: Returns an error if the post is unaccessible or was not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Not found. Couldn't find post"
 *       409:
 *         description: Returns an error if the post has already reacted with that type.
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
 *                   example: "LIKE_ALREADY_EXISTS"
 *       422:
 *         description: Returns an error if given type is not like or retweet.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Invalid provided data"
 *                 error_code:
 *                   type: string
 *                   example: "INVALID_REACTION_TYPE"
 */
reactionRouter.post('/:postId', async (req: Request, res: Response) => {
  const { type } = req.query as Record<string, string>
  const { userId } = res.locals.context
  const { postId } = req.params

  if (!type || (type.toUpperCase() !== ReactionEnum.LIKE && type.toUpperCase() !== ReactionEnum.RETWEET)) {
    throw new QueryException('INAVLID_REACTION_TYPE')
  }

  await reactionService.reactToPost(userId, postId, type.toUpperCase() as ReactionEnum)

  res.status(httpStatus.CREATED).send('Reacted successfully')
})

/**
 * @openapi
 *
 * /reaction/{postId}:
 *   delete:
 *     summary: Deletes a reaction from a post.
 *     tags:
 *       - Reactions
 *     security:
 *       - auth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         description: The id of the post to delete reaction.
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: type
 *         description: Reaction type, can be like or retweet.
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Post reacted successfully.
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
 *       404:
 *         description: Returns an error if the post is unaccessible or was not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Not found. Couldn't find post"
 *       409:
 *         description: Returns an error if the post has not reacted with that type.
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
 *                   example: "RETWEET_NOT_EXISTS"
 *       422:
 *         description: Returns an error if given type is not like or retweet.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Invalid provided data"
 *                 error_code:
 *                   type: string
 *                   example: "INVALID_REACTION_TYPE"
 */
reactionRouter.delete('/:postId', async (req: Request, res: Response) => {
  const { type } = req.query as Record<string, string>
  const { userId } = res.locals.context
  const { postId } = req.params

  if (!type || (type.toUpperCase() !== ReactionEnum.LIKE && type.toUpperCase() !== ReactionEnum.RETWEET)) {
    throw new QueryException('INAVLID_REACTION_TYPE')
  }

  await reactionService.deleteReaction(userId, postId, type.toUpperCase() as ReactionEnum)

  res.status(httpStatus.NO_CONTENT).send()
})
