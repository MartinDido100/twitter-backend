import { Router, Request, Response } from 'express'
import { CommentServiceImpl } from '../service'
import { CommentRepositoryImpl } from '../repository'
import { BodyValidation, db } from '@utils'
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
  new PostRepositoryImpl(db))

commentRouter.post('/:postId', BodyValidation(CreatePostInputDTO), async (req: Request, res: Response) => {
  const { userId } = res.locals.context
  const { postId } = req.params
  const data = req.body

  const comment = await commentService.commentPost(userId, postId, data)

  return res.status(HttpStatus.CREATED).json(comment)
})

commentRouter.get('/by_user/:userId', async (req: Request, res: Response) => {
  const { userId } = req.params

  const comments = await commentService.getCommentsByUser(userId)

  return res.status(HttpStatus.OK).json(comments)
})

commentRouter.get('/:postId', async (req: Request, res: Response) => {
  const { postId } = req.params
  // Record es como un set de java pero con tipos, trato al query asi pq el tipo que viene con ts no me sirve
  const { after, before, limit } = req.query as Record<string, string>

  const comments = await commentService.getCommentsByPost(postId, { after, before, limit: parseInt(limit) })

  return res.status(HttpStatus.OK).json(comments)
})
