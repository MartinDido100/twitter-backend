import { Request, Response, Router } from 'express';
import HttpStatus from 'http-status';
import { MessageServiceImpl } from '../service';
import { MessageRepositoryImpl } from '../repository';
import { db } from '@utils';

import 'express-async-errors';

export const messageRouter = Router();

const service = new MessageServiceImpl(new MessageRepositoryImpl(db));

/**
 * @openapi
 *
 * /messages/history/{userId}:
 *   get:
 *     summary: Get the history of messages between the logged user and the user with the given id.
 *     security:
 *       - auth: []
 *     tags:
 *       - Messages
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: The id of the user to get the history of messages with.
 *     responses:
 *       200:
 *         description: Returns an array of messages between the two users ordered by date.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     example: "0c498c13-ade8-4a2f-b5c3-62e6b06cf13e"
 *                   senderId:
 *                     type: string
 *                     example: "0c498c13-ade8-4a2f-b5c3-62e6b06cf13e"
 *                   receiverId:
 *                     type: string
 *                     example: "0c498c13-ade8-4a2f-b5c3-62e6b06cf13e"
 *                   content:
 *                     type: string
 *                     example: "Hello!"
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *                     example: "2021-08-01T12:00:00.000Z"
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
messageRouter.get('/history/:userId', async (req: Request, res: Response) => {
  const { userId } = res.locals.context;
  const { userId: otherUserId } = req.params;

  const messages = await service.getHistory(userId, otherUserId);

  return res.status(HttpStatus.OK).json(messages);
});
