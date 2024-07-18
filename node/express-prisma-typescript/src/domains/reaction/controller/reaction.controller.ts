import { db } from '@utils'
import { Request, Response, Router } from 'express'
import { ReactionServiceImpl } from '../service'
import { ReactionRepositoryImpl } from '../repository'
import httpStatus from 'http-status'

import 'express-async-errors'

export const reactionRouter = Router()

const reactionService = new ReactionServiceImpl(new ReactionRepositoryImpl(db))

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
 */

/**
 * @openapi
 *
 * /reaction/likes/:userId:
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
 * /reaction/retweet/{postId}:
 *   post:
 *     summary: Retweets a post.
 *     tags:
 *       - Reactions
 *     security:
 *       - auth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         description: The id of the post to retweet.
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       201:
 *         description: Tweet retweeted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               example: "Retweeted successfully"
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
 *       409:
 *         description: Returns an error if the user has already retweeted the post.
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
 *                   example: "ALREADY_RETWEETED"
 */
reactionRouter.post('/retweet/:postId', async (req: Request, res: Response) => {
  const { userId } = res.locals.context
  const { postId } = req.params

  await reactionService.retweet(userId, postId)
  res.status(httpStatus.CREATED).send('Retweeted successfully')
})

/**
 * @openapi
 *
 * /reaction/like/{postId}:
 *   post:
 *     summary: Likes a post.
 *     tags:
 *       - Reactions
 *     security:
 *       - auth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         description: The id of the post to like.
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       201:
 *         description: Tweet liked successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               example: "Liked successfully"
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
 *       409:
 *         description: Returns an error if the user has already liked the post.
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
 *                   example: "ALREADY_LIKED"
 */
reactionRouter.post('/like/:postId', async (req: Request, res: Response) => {
  const { userId } = res.locals.context
  const { postId } = req.params

  await reactionService.like(userId, postId)
  res.status(httpStatus.CREATED).send('Liked successfully')
})

/**
 * @openapi
 *
 * /reaction/like/{postId}:
 *   delete:
 *     summary: Removes a like from a post.
 *     tags:
 *       - Reactions
 *     security:
 *       - auth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         description: The id of the post to remove the like.
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       201:
 *         description: Post disliked successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               example: "Disliked successfully"
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
 *       409:
 *         description: Returns an error if the user has not liked the post.
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
 *                   example: "NOT_LIKED"
 */
reactionRouter.delete('/like/:postId', async (req: Request, res: Response) => {
  const { userId } = res.locals.context
  const { postId } = req.params

  await reactionService.dislike(userId, postId)
  res.status(httpStatus.CREATED).send('Disliked successfully')
})

/**
 * @openapi
 *
 * /reaction/retweet/:postId:
 *   delete:
 *     summary: Removes a retweet from a post.
 *     tags:
 *       - Reactions
 *     security:
 *       - auth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         description: The id of the post to unretweet.
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       201:
 *         description: Post unretweeted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               example: "Unretweet successfully"
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
 *       409:
 *         description: Returns an error if the user has not retweeted the post.
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
 *                   example: "NOT_RETWEETED"
 */
reactionRouter.delete('/retweet/:postId', async (req: Request, res: Response) => {
  const { userId } = res.locals.context
  const { postId } = req.params

  await reactionService.unretweet(userId, postId)
  res.status(httpStatus.CREATED).send('Unretweeted successfully')
})
