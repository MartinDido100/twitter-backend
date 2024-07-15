import { Request, Response, Router } from 'express'
import HttpStatus from 'http-status'
// express-async-errors is a module that handles async errors in express, don't forget import it in your new controllers
import 'express-async-errors'

import { db, InvalidExtensionException, s3 } from '@utils'

import { UserRepositoryImpl } from '../repository'
import { UserService, UserServiceImpl } from '../service'
import { BucketManager } from '@utils/s3bucket'
import { AllowedExtensions } from '../dto'

export const userRouter = Router()

// Use dependency injection
const service: UserService = new UserServiceImpl(new UserRepositoryImpl(db), new BucketManager(s3))

userRouter.get('/', async (req: Request, res: Response) => {
  const { userId } = res.locals.context
  const { limit, skip } = req.query as Record<string, string>

  const users = await service.getUserRecommendations(userId, { limit: Number(limit), skip: Number(skip) })

  return res.status(HttpStatus.OK).json(users)
})

userRouter.get('/me', async (req: Request, res: Response) => {
  const { userId } = res.locals.context

  const user = await service.getUser(userId)

  return res.status(HttpStatus.OK).json(user)
})

userRouter.get('/:userId', async (req: Request, res: Response) => {
  const { userId: otherUserId } = req.params

  const user = await service.getUser(otherUserId)

  return res.status(HttpStatus.OK).json(user)
})

userRouter.delete('/', async (req: Request, res: Response) => {
  const { userId } = res.locals.context

  await service.deleteUser(userId)

  return res.status(HttpStatus.OK)
})

userRouter.put('/profile', async (req: Request, res: Response) => {
  const { userId } = res.locals.context

  const { extension } = req.query as Record<string, AllowedExtensions>

  if (![AllowedExtensions.PNG, AllowedExtensions.JPG, AllowedExtensions.JPEG].includes(extension)) {
    throw new InvalidExtensionException()
  }

  const uploadUrl = await service.updateProfilePicture(userId, extension)

  return res.status(HttpStatus.OK).json({ uploadUrl })
})

userRouter.put('/unprivate', async (req: Request, res: Response) => {
  const { userId } = res.locals.context

  await service.unprivateUser(userId)

  return res.status(HttpStatus.OK).send('User is now public')
})

userRouter.put('/private', async (req: Request, res: Response) => {
  const { userId } = res.locals.context

  await service.privateUser(userId)

  return res.status(HttpStatus.OK).send('User is now private')
})
