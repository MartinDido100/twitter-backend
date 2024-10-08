import { Router, Request, Response } from 'express'
import { CommentServiceImpl } from '../service'
import { CommentRepositoryImpl } from '../repository'
import { BodyValidation, BucketManager, db, imagesExtensionValidation, s3 } from '@utils'
import { CreatePostInputDTO } from '@domains/post/dto'
import HttpStatus from 'http-status'
import { PostRepositoryImpl } from '@domains/post/repository'
import { UserRepositoryImpl } from '@domains/user/repository'
import { FollowRepositoryImpl } from '@domains/follow/repository'

import 'express-async-errors'

export const commentRouter = Router()

const commentService = new CommentServiceImpl(
  new CommentRepositoryImpl(db),
  new FollowRepositoryImpl(db),
  new UserRepositoryImpl(db),
  new PostRepositoryImpl(db),
  new BucketManager(s3))

/**
 * @openapi
 * components:
 *   schemas:
 *     ExtendedComment:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Post id
 *           example: "aa649330-d933-40df-b029-12c5a60a041d"
 *         content:
 *           type: string
 *           description: Post content
 *           example: "Content of the comment"
 *         authorId:
 *           type: string
 *           description: Author id
 *           example: "0c498c13-ade8-4a2f-b5c3-62e6b06cf13e"
 *         createdAt:
 *           type: string
 *           example: "2021-07-12T21:00:00.000Z"
 *         updatedAt:
 *           type: string
 *           example: "2021-07-12T21:00:00.000Z"
 *         images:
 *           description: Array with presigned images urls
 *           example: [List of urls]
 *         qtyComments:
 *           description: Number of comments
 *           type: number
 *         qtyLikes:
 *           description: Number of likes
 *           type: number
 *         qtyRetweets:
 *           description: Number of retweets
 *           type: number
 *         author:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *               example: "0c498c13-ade8-4a2f-b5c3-62e6b06cf13e"
 *             name:
 *               type: string
 *               example: "John"
 *             username:
 *               type: string
 *               example: "username"
 *             profilePicture:
 *               type: string
 *               description: "AWS Presigned URL (Can be null)"
 *               example: "AWS Presigned URL"
 *     Comment:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Comment id
 *           example: "aa649330-d933-40df-b029-12c5a60a041d"
 *         content:
 *           type: string
 *           description: Comment content
 *           example: "This is a comment"
 *         parentId:
 *           type: string
 *           description: Parent post id
 *           example: "8f0db25a-39ad-463c-a1b7-c6c8669dba1b"
 *         authorId:
 *           type: string
 *           description: Author id
 *           example: "0c498c13-ade8-4a2f-b5c3-62e6b06cf13e"
 *         createdAt:
 *           type: string
 *           example: "2021-07-12T21:00:00.000Z"
 *         updatedAt:
 *           type: string
 *           example: "2021-07-12T21:00:00.000Z"
 *         images:
 *           description: Comment images
 *           example: [List of urls]
 */

/**
 * @openapi
 *
 * /comment/by_user/{userId}:
 *   get:
 *     summary: Get comments by given user id.
 *     tags:
 *       - Comments
 *     security:
 *       - auth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *     responses:
 *       200:
 *         description: Returns an array of comments made by the user.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ExtendedComment'
 *       404:
 *         description: Returns an error if the user was not found or is unaccessible.
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
commentRouter.get('/by_user/:userId', async (req: Request, res: Response) => {
  const { userId } = res.locals.context
  const { userId: otherUserId } = req.params

  const comments = await commentService.getCommentsByUser(userId, otherUserId)

  return res.status(HttpStatus.OK).json(comments)
})

/**
 * @openapi
 *
 * /comment/{postId}:
 *   get:
 *     summary: Get comments by given post id.
 *     tags:
 *       - Comments
 *     security:
 *       - auth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the post for which comments are to be fetched.
 *     responses:
 *       200:
 *         description: Returns an array of comments of the provided post.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ExtendedComment'
 *       404:
 *         description: Returns an error if the post was not found or is unaccessible.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Not found. Couldn't find post"
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
commentRouter.get('/:postId', async (req: Request, res: Response) => {
  const { postId } = req.params
  const { userId } = res.locals.context
  const { after, before, limit } = req.query as Record<string, string>

  const comments = await commentService.getCommentsByPost(userId, postId, { after, before, limit: parseInt(limit) })

  return res.status(HttpStatus.OK).json(comments)
})

/**
 * @openapi
 *
 * /comment/{postId}:
 *   post:
 *     summary: Comments the given post.
 *     tags:
 *       - Comments
 *     security:
 *       - auth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the post to comment on.
 *     requestBody:
 *       description: Comment body (images are optional).
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreatePostBody'
 *     responses:
 *       201:
 *         description: Returns the created comment.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Comment'
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
 *         description: Returns an error if the post was not found or is unaccessible.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Not found. Couldn't find post"
 *       400:
 *         description: Returns an error that means bad request error (invalid body).
 */
commentRouter.post('/:postId', BodyValidation(CreatePostInputDTO), imagesExtensionValidation(), async (req: Request, res: Response) => {
  const { userId } = res.locals.context
  const { postId } = req.params
  const data = req.body

  const comment = await commentService.commentPost(userId, postId, data)

  return res.status(HttpStatus.CREATED).json(comment)
})
