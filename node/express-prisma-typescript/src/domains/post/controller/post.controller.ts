import { Request, Response, Router } from 'express'
import HttpStatus from 'http-status'
// express-async-errors is a module that handles async errors in express, don't forget import it in your new controllers
import 'express-async-errors'

import { db, BodyValidation, s3, imagesExtensionValidation } from '@utils'

import { PostRepositoryImpl } from '../repository'
import { PostService, PostServiceImpl } from '../service'
import { CreatePostInputDTO } from '../dto'
import { FollowRepositoryImpl } from '@domains/follow/repository'
import { UserRepositoryImpl } from '@domains/user/repository'
import { BucketManager } from '@utils/s3bucket'

export const postRouter = Router()

// Use dependency injection
const service: PostService = new PostServiceImpl(
  new PostRepositoryImpl(db),
  new FollowRepositoryImpl(db),
  new UserRepositoryImpl(db),
  new BucketManager(s3)
)

/**
 * @openapi
 * components:
 *   schemas:
 *     ExtendedPost:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Post id
 *           example: "aa649330-d933-40df-b029-12c5a60a041d"
 *         content:
 *           type: string
 *           description: Post content
 *           example: "Content of the post"
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
 *           type: array
 *           description: Array with presigned images URLs
 *           items:
 *             type: string
 *           example: [List of urls]
 *         qtyComments:
 *           type: number
 *           description: Number of comments
 *         qtyLikes:
 *           type: number
 *           description: Number of likes
 *         qtyRetweets:
 *           type: number
 *           description: Number of retweets
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
 *     Post:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Post id
 *           example: "aa649330-d933-40df-b029-12c5a60a041d"
 *         content:
 *           type: string
 *           description: Post content
 *           example: "Content of the post"
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
 *           type: array
 *           description: Array with presigned images URLs
 *           items:
 *             type: string
 *           example: [List of urls]
 *     CreatePostBody:
 *       type: object
 *       properties:
 *         content:
 *           type: string
 *           description: The post content.
 *           example: "This is a post"
 *         images:
 *           type: array
 *           items:
 *             type: string
 *           description: The post images, only jpg, jpeg and png extensions are allowed. Images are not required
 *           example: ["image1.jpg", "image2.png"]
 */

/**
 * @openapi
 *
 * /post:
 *   get:
 *     summary: Get the latest posts from authors that the user follows or has public profile.
 *     tags:
 *       - Posts
 *     security:
 *       - auth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         description: The number of posts to return before or after the cursor.
 *         required: false
 *         schema:
 *           type: integer
 *       - in: query
 *         name: before
 *         description: Cursor to get posts before this userId.
 *         required: false
 *         schema:
 *           type: string
 *       - in: query
 *         name: after
 *         description: Cursor to get posts after this userId.
 *         required: false
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Returns an array of posts from authors that the user follows.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ExtendedPost'
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
postRouter.get('/', async (req: Request, res: Response) => {
  const { userId } = res.locals.context
  const { limit, before, after } = req.query as Record<string, string>

  const posts = await service.getLatestPosts(userId, { limit: Number(limit), before, after })

  return res.status(HttpStatus.OK).json(posts)
})

/**
 * @openapi
 *
 * /post/{postId}:
 *   get:
 *     summary: Get a post by its id.
 *     tags:
 *       - Posts
 *     security:
 *       - auth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         description: The id of the post to get.
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Returns the given post.
 *         content:
 *           application/json:
 *             schema:
 *                 $ref: '#/components/schemas/Post'
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
postRouter.get('/:postId', async (req: Request, res: Response) => {
  const { userId } = res.locals.context
  const { postId } = req.params

  const post = await service.getPost(userId, postId)

  return res.status(HttpStatus.OK).json(post)
})

/**
 * @openapi
 *
 * /post/by_user/{userId}:
 *   get:
 *     summary: Get posts by given user id.
 *     tags:
 *       - Posts
 *     security:
 *       - auth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         description: The id of the user to get his posts.
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Returns an array of posts from the given author.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ExtendedPost'
 *       404:
 *         description: Returns an error if the post is unaccessible.
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
postRouter.get('/by_user/:userId', async (req: Request, res: Response) => {
  const { userId } = res.locals.context
  const { userId: authorId } = req.params

  const posts = await service.getPostsByAuthor(userId, authorId)

  return res.status(HttpStatus.OK).json(posts)
})

/**
 * @openapi
 *
 * /post/by_user/{userId}:
 *   post:
 *     summary: Get posts by given user id.
 *     tags:
 *       - Posts
 *     security:
 *       - auth: []
 *     requestBody:
 *      required: true
 *      description: The post content and images(optional).
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/CreatePostBody'
 *     responses:
 *       201:
 *         description: Returns the created post.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Post'
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
 *       400:
 *         description: Returns an error that means bad request error (incomplete body, invalid image name or extension).
 */
postRouter.post('/', BodyValidation(CreatePostInputDTO), imagesExtensionValidation(), async (req: Request, res: Response) => {
  const { userId } = res.locals.context
  const data = req.body

  const post = await service.createPost(userId, data)

  return res.status(HttpStatus.CREATED).json(post)
})

/**
 * @openapi
 *
 * /post/{postId}:
 *   delete:
 *     summary: Delete a post by its id.
 *     tags:
 *       - Posts
 *     security:
 *       - auth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         description: The id of the post to delete.
 *         required: true
 *     responses:
 *       200:
 *         description: Post deleted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               example: "Deleted post aa649330-d933-40df-b029-12c5a60a041d"
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
 *         description: Returns an error if the post to delete was not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Not found. Couldn't find post"
 *       403:
 *         description: Returns an error if the author is not the same as the requester.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Forbidden. You are not allowed to perform this action"
 */
postRouter.delete('/:postId', async (req: Request, res: Response) => {
  const { userId } = res.locals.context
  const { postId } = req.params

  await service.deletePost(userId, postId)

  return res.status(HttpStatus.OK).send(`Deleted post ${postId}`)
})
