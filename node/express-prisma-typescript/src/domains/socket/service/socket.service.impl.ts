import { FollowRepository } from '@domains/follow/repository'
import { SocketService } from '.'
import { MessageRepository } from '@domains/message'
import { CreateMessageInputDTO, MessageDTO } from '@domains/message/dto'

export class SocketServiceImpl implements SocketService {
  constructor (
    private readonly followRepo: FollowRepository,
    private readonly messageRepo: MessageRepository) {}

  async checkFollows (userIdA: string, userIdB: string): Promise<boolean> {
    const aFollowsB = await this.followRepo.checkFollow(userIdA, userIdB)
    const bFollowsA = await this.followRepo.checkFollow(userIdB, userIdA)

    return aFollowsB && bFollowsA
  }

  async createMessage (senderId: string, data: CreateMessageInputDTO): Promise<MessageDTO> {
    return await this.messageRepo.create(senderId, data)
  }
}
