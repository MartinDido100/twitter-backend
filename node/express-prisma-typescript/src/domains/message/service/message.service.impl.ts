import { MessageService } from './message.service'
import { MessageDTO } from '../dto'
import { MessageRepository } from '../repository'
import { UserRepository } from '@domains/user/repository'
import { NotFoundException } from '@utils'

export class MessageServiceImpl implements MessageService {
  constructor (private readonly messageRepository: MessageRepository, private readonly userRepo: UserRepository) {}

  async getHistory (userId: string, otherUserId: string): Promise<MessageDTO[]> {
    const user = await this.userRepo.getById(otherUserId)

    if (!user) {
      throw new NotFoundException('user')
    }

    return await this.messageRepository.getMessageHistory(userId, otherUserId)
  }
}
