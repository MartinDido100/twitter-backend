import { Request, Response, Router } from 'express'
import HttpStatus from 'http-status'
// express-async-errors is a module that handles async errors in express, don't forget import it in your new controllers
import 'express-async-errors'

import { db, InvalidExtensionException, s3, BucketManager } from '@utils'

import { UserRepositoryImpl } from '../repository'
import { UserService, UserServiceImpl } from '../service'
import { AllowedExtensions } from '../dto'
import { FollowRepositoryImpl } from '@domains/follow/repository'

export const userRouter = Router()

// Use dependency injection
const service: UserService = new UserServiceImpl(new UserRepositoryImpl(db), new BucketManager(s3), new FollowRepositoryImpl(db))

/**
 * @openapi
 * components:
 *   schemas:
 *     UserView:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: "1"
 *         name:
 *           type: string
 *           example: "John"
 *         username:
 *           type: string
 *           example: "username"
 *         profilePicture:
 *           type: string
 *           description: "AWS Presigned URL (Can be null)"
 *           example: "AWS Presigned URL"
 *     ExtendedUserView:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: "1"
 *         name:
 *           type: string
 *           example: "John"
 *         username:
 *           type: string
 *           example: "username"
 *         profilePicture:
 *           type: string
 *           description: "AWS Presigned URL (Can be null)"
 *           example: "AWS Presigned URL"
 *         followsYou:
 *           type: boolean
 *           example: true
 *           description: If requested user follows logged user
 */

/**
 * @openapi
 *
 * /user:
 *   get:
 *     summary: Get logged user recommendations.
 *     description: Returns a list of users that followed by users that logged user follows
 *     tags:
 *       - User
 *     security:
 *       - auth: []
 *     responses:
 *       200:
 *         description: Returns the logged user recommendations as array.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/UserView'
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
userRouter.get('/', async (req: Request, res: Response) => {
  const { userId } = res.locals.context
  const { limit, skip } = req.query as Record<string, string>

  const users = await service.getUserRecommendations(userId, { limit: Number(limit), skip: Number(skip) })

  return res.status(HttpStatus.OK).json(users)
})

/**
 * @openapi
 *
 * /user/me:
 *   get:
 *     summary: Get logged user information.
 *     tags:
 *       - User
 *     security:
 *       - auth: []
 *     responses:
 *       200:
 *         description: Returns the logged user information.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserView'
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
 *         description: Returns an error if the logged user was not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User not found."
 */
userRouter.get('/me', async (req: Request, res: Response) => {
  const { userId } = res.locals.context

  const user = await service.getLoggedUser(userId)

  return res.status(HttpStatus.OK).json(user)
})

/**
 * @openapi
 *
 * /user/{userId}:
 *   get:
 *     summary: Get user information by id
 *     tags:
 *       - User
 *     security:
 *       - auth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user to get information.
 *     responses:
 *       200:
 *         description: Returns information about the given user.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ExtendedUserView'
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
 *         description: Returns an error if the user was not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User not found."
 */
userRouter.get('/:userId', async (req: Request, res: Response) => {
  const { userId: otherUserId } = req.params
  const { userId } = res.locals.context

  const user = await service.getUser(userId, otherUserId)

  return res.status(HttpStatus.OK).json(user)
})

/**
 * @openapi
 *
 * /user/by_username/{username}:
 *   get:
 *     summary: Get a list of users whose usernames are included in the given username.
 *     tags:
 *       - User
 *     security:
 *       - auth: []
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         schema:
 *           type: string
 *         description: The username to query.
 *       - in: query
 *         name: limit
 *         description: The number of users to return before or after the cursor.
 *         required: false
 *         schema:
 *           type: integer
 *       - in: query
 *         name: before
 *         description: Cursor to get users before this userId.
 *         required: false
 *         schema:
 *           type: string
 *       - in: query
 *         name: after
 *         description: Cursor to get users after this userId.
 *         required: false
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Returns a list of users whose usernames are included in the given username (empty list if no users found).
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserView'
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
userRouter.get('/by_username/:username', async (req: Request, res: Response) => {
  const { username } = req.params
  const { limit, before, after } = req.query as Record<string, string>

  const user = await service.getUsersByUsername(username, { limit: Number(limit), before, after })

  return res.status(HttpStatus.OK).json(user)
})

/**
 * @openapi
 *
 * /user:
 *   delete:
 *     summary: Deletes the logged user.
 *     tags:
 *       - User
 *     security:
 *       - auth: []
 *     responses:
 *       204:
 *         description: User deleted successfully.
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
userRouter.delete('/', async (req: Request, res: Response) => {
  const { userId } = res.locals.context

  await service.deleteUser(userId)

  return res.status(HttpStatus.NO_CONTENT)
})

/**
 * @openapi
 *
 * /user/profile:
 *   put:
 *     summary: Updates the profile picture of the logged user.
 *     tags:
 *       - User
 *     security:
 *       - auth: []
 *     parameters:
 *       - in: query
 *         name: extension
 *         required: true
 *         schema:
 *           type: string
 *         description: "Extension of the image (only png, jpg, jpeg)."
 *     responses:
 *       200:
 *         description: Returns the presigned URL for uploading the profile picture.
 *         content:
 *           application/json:
 *             schema:
 *              type: object
 *              properties:
 *                uploadUrl:
 *                  type: string
 *                  example: "AWS Presigned URL"
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
 *       415:
 *         description: Returns an error if the extension is not valid.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Invalid extension"
 */
userRouter.put('/profile', async (req: Request, res: Response) => {
  const { userId } = res.locals.context

  const { extension } = req.query as Record<string, AllowedExtensions>

  if (![AllowedExtensions.PNG, AllowedExtensions.JPG, AllowedExtensions.JPEG].includes(extension)) {
    throw new InvalidExtensionException()
  }

  const uploadUrl = await service.updateProfilePicture(userId, extension)

  return res.status(HttpStatus.OK).json({ uploadUrl })
})

/**
 * @openapi
 *
 * /user/unprivate:
 *   put:
 *     summary: Makes the logged user public.
 *     tags:
 *       - User
 *     security:
 *       - auth: []
 *     responses:
 *       204:
 *         description: User successfully made public.
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
userRouter.put('/unprivate', async (req: Request, res: Response) => {
  const { userId } = res.locals.context

  await service.unprivateUser(userId)

  return res.status(HttpStatus.NO_CONTENT).send()
})

/**
 * @openapi
 *
 * /user/private:
 *   put:
 *     summary: Makes the logged user private.
 *     tags:
 *       - User
 *     security:
 *       - auth: []
 *     responses:
 *       204:
 *         description: User successfully made private.
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
userRouter.put('/private', async (req: Request, res: Response) => {
  const { userId } = res.locals.context

  await service.privateUser(userId)

  return res.status(HttpStatus.NO_CONTENT).send()
})
