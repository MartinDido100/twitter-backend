import { db } from '@utils'
import { Request, Response, Router } from 'express'
import { ReactionServiceImpl } from '../service'
import { ReactionRepositoryImpl } from '../repository'
import httpStatus from 'http-status'

import 'express-async-errors'

export const reactionRouter = Router()

const reactionService = new ReactionServiceImpl(new ReactionRepositoryImpl(db))

reactionRouter.post('/like/:postId', async (req: Request, res: Response) => {
  const { userId } = res.locals.context
  const { postId } = req.params

  await reactionService.like(userId, postId)
  res.status(httpStatus.CREATED).send('Liked successfully')
})

reactionRouter.delete('/like/:postId', async (req: Request, res: Response) => {
  const { userId } = res.locals.context
  const { postId } = req.params

  await reactionService.dislike(userId, postId)
  res.status(httpStatus.CREATED).send('Disliked successfully')
})

reactionRouter.post('/retweet/:postId', async (req: Request, res: Response) => {
  const { userId } = res.locals.context
  const { postId } = req.params

  await reactionService.retweet(userId, postId)
  res.status(httpStatus.CREATED).send('Retweeted successfully')
})

reactionRouter.delete('/retweet/:postId', async (req: Request, res: Response) => {
  const { userId } = res.locals.context
  const { postId } = req.params

  await reactionService.like(userId, postId)
  res.status(httpStatus.CREATED).send('Unretweeted successfully')
})

reactionRouter.get('/likes/:userId', async (req: Request, res: Response) => {
  const { userId } = req.params

  const likes = await reactionService.getLikes(userId)
  res.status(httpStatus.OK).json(likes)
})

reactionRouter.get('/retweets/:userId', async (req: Request, res: Response) => {
  const { userId } = req.params

  const retweets = await reactionService.getRetweets(userId)
  res.status(httpStatus.OK).json(retweets)
})
