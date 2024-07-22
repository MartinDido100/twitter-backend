import { PrismaClient } from '@prisma/client'
import { MessageRepository } from './message.repository'
import { CreateMessageInputDTO, MessageDTO } from '../dto'

export class MessageRepositoryImpl implements MessageRepository {
  constructor (private readonly db: PrismaClient) {}

  async getMessageHistory (senderId: string, receiverId: string): Promise<MessageDTO[]> {
    return await this.db.message.findMany({
      where: {
        OR: [
          {
            receiverId,
            senderId
          },
          {
            receiverId: senderId,
            senderId: receiverId
          }
        ]
      },
      orderBy: [
        {
          createdAt: 'asc'
        }
      ]
    })
  }

  async create (senderId: string, data: CreateMessageInputDTO): Promise<MessageDTO> {
    return await this.db.message.create({
      data: {
        senderId,
        ...data
      }
    })
  }
}
