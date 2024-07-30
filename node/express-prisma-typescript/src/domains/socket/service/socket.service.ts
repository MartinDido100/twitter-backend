import { CreateMessageInputDTO, MessageDTO } from '@domains/message/dto'

export interface SocketService {
  checkFollowEachOther: (userIdA: string, userIdB: string) => Promise<boolean>
  createMessage: (senderId: string, data: CreateMessageInputDTO) => Promise<MessageDTO>
}
