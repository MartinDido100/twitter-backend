import { Router } from 'express'
import { withAuth } from '@utils'

import { userRouter } from '@domains/user'
import { postRouter } from '@domains/post'
import { authRouter } from '@domains/auth'
import { healthRouter } from '@domains/health'
import { followerRouter } from '@domains/follow'
import { reactionRouter } from '@domains/reaction'
import { commentRouter } from '@domains/comment'
import { messageRouter } from '@domains/message'

export const router = Router()

router.use('/health', healthRouter)
router.use('/auth', authRouter)
router.use('/user', withAuth, userRouter)
router.use('/post', withAuth, postRouter)
router.use('/follower', withAuth, followerRouter)
router.use('/reaction', withAuth, reactionRouter)
router.use('/comment', withAuth, commentRouter)
router.use('/messages', withAuth, messageRouter)
