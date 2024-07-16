import { Request, Response, Router } from 'express'
import { FollowServiceImpl } from '../service'
import { FollowRepositoryImpl } from '../repository'
import { db } from '@utils'
import HttpStatus from 'http-status'

import 'express-async-errors'

export const followerRouter = Router()

const service = new FollowServiceImpl(new FollowRepositoryImpl(db))

followerRouter.post('/follow/:userId', async (req: Request, res: Response) => {
  const { userId } = res.locals.context
  const { userId: followUserId } = req.params

  await service.followUser(userId, followUserId)
  res.status(HttpStatus.CREATED).send('Followed')
})

followerRouter.post('/unfollow/:userId', async (req: Request, res: Response) => {
  const { userId } = res.locals.context
  const { userId: followUserId } = req.params
  await service.unfollowUser(userId, followUserId)
  res.status(HttpStatus.CREATED).send('Unfollowed')
})
