import { CreateMessageInputDTO, MessageDTO } from '../dto'

export interface MessageRepository {
  getMessageHistory: (senderId: string, receiverId: string) => Promise<MessageDTO[]>
  create: (senderId: string, data: CreateMessageInputDTO) => Promise<MessageDTO>
}
