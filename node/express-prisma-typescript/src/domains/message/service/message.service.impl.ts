import { MessageService } from './message.service'
import { CreateMessageInputDTO, MessageDTO } from '../dto'
import { MessageRepository } from '../repository'

export class MessageServiceImpl implements MessageService {
  constructor (private readonly messageRepository: MessageRepository) {}

  async getHistory (userId: string, otherUserId: string): Promise<MessageDTO[]> {
    return await this.messageRepository.getMessageHistory(userId, otherUserId)
  }

  async createMessage (userId: string, data: CreateMessageInputDTO): Promise<MessageDTO> {
    return await this.messageRepository.create(userId, data)
  }
}
