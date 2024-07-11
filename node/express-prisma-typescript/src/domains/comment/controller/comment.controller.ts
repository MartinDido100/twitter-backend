import { Router, Request, Response } from 'express'
import { CommentServiceImpl } from '../service'
import { CommentRepositoryImpl } from '../repository'
import { BodyValidation, db } from '@utils'
import { CreatePostInputDTO } from '@domains/post/dto'
import HttpStatus from 'http-status'

export const commentRouter = Router()

const commentService = new CommentServiceImpl(new CommentRepositoryImpl(db))

commentRouter.post('/:postId', BodyValidation(CreatePostInputDTO), async (req: Request, res: Response) => {
  const { userId } = res.locals.context
  const { postId } = req.params
  const data = req.body

  const comment = await commentService.commentPost(userId, postId, data)

  return res.status(HttpStatus.CREATED).json(comment)
})

commentRouter.get('/:userId', async (req: Request, res: Response) => {
  const { userId } = req.params

  const comments = await commentService.getCommentsByUser(userId)

  return res.status(HttpStatus.OK).json(comments)
})
