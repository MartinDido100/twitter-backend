import { MessageDTO } from '../dto'

export interface MessageService {
  getHistory: (userId: string, otherUserId: string) => Promise<MessageDTO[]>
}
