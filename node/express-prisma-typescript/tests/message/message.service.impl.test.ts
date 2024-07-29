import { MessageService, MessageServiceImpl } from '@domains/message'
import { messageRepositoryMock } from './message.mock'

describe('Message service tests', () => {
  let service: MessageService
  beforeEach(() => {
    service = new MessageServiceImpl(messageRepositoryMock)
    jest.resetAllMocks()
  })

  describe('getHistory method', () => {
    it('should return an array of messages', async () => {
      // given
      const loggedId = 'loggedId'
      const otherId = 'otherId'
      const createdAt = new Date()

      messageRepositoryMock.getMessageHistory.mockResolvedValue([
        {
          id: 'messageId1',
          receiverId: loggedId,
          senderId: otherId,
          createdAt,
          content: 'Message content'
        },
        {
          id: 'messageId2',
          receiverId: otherId,
          senderId: loggedId,
          createdAt,
          content: 'Message content 2'
        }
      ])

      const expected = [
        {
          id: 'messageId1',
          receiverId: loggedId,
          senderId: otherId,
          createdAt,
          content: 'Message content'
        },
        {
          id: 'messageId2',
          receiverId: otherId,
          senderId: loggedId,
          createdAt,
          content: 'Message content 2'
        }
      ]

      // when
      const result = await service.getHistory(loggedId, otherId)

      // then
      expect(result).toEqual(expected)
      expect(messageRepositoryMock.getMessageHistory).toHaveBeenCalled()
    })

    it('should return an empty array if there are no messages', async () => {
      // given
      const loggedId = 'loggedId'
      const otherId = 'otherId'

      messageRepositoryMock.getMessageHistory.mockResolvedValue([])

      // when
      const result = await service.getHistory(loggedId, otherId)

      // then
      expect(result).toEqual([])
      expect(messageRepositoryMock.getMessageHistory).toHaveBeenCalled()
    })
  })
})
