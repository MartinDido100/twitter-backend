import { Request, Response, Router } from 'express'
import HttpStatus from 'http-status'
import { MessageServiceImpl } from '../service'
import { MessageRepositoryImpl } from '../repository'
import { db } from '@utils'

export const messageRouter = Router()

const service = new MessageServiceImpl(new MessageRepositoryImpl(db))

messageRouter.get('/history/:userId', async (req: Request, res: Response) => {
  const { userId } = res.locals.context
  const { userId: otherUserId } = req.params

  const messages = await service.getHistory(userId, otherUserId)

  return res.status(HttpStatus.OK).json(messages)
})
