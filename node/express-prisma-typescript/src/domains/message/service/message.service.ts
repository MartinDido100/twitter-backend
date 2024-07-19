import { CreateMessageInputDTO, MessageDTO } from '../dto'

export interface MessageService {
  getHistory: (userId: string, otherUserId: string) => Promise<MessageDTO[]>
  createMessage: (userId: string, data: CreateMessageInputDTO) => Promise<MessageDTO>
}
