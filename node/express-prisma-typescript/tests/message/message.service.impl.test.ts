import { MessageService, MessageServiceImpl } from '@domains/message'
import { messageRepositoryMock } from './message.mock'
import { userRepositoryMock } from '../mock'
import { NotFoundException } from '@utils'

describe('Message service tests', () => {
  let service: MessageService
  beforeEach(() => {
    service = new MessageServiceImpl(messageRepositoryMock, userRepositoryMock)
    jest.resetAllMocks()
  })

  describe('getHistory method', () => {
    it('should return an array of messages', async () => {
      // given
      const loggedId = 'loggedId'
      const otherId = 'otherId'
      const createdAt = new Date()

      userRepositoryMock.getById.mockResolvedValue({
        id: otherId,
        username: 'username',
        name: 'name',
        profilePicture: null
      })

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

    it('should throw NotFoundException if user to get history does not exist', async () => {
      // given
      const loggedId = 'loggedId'
      const otherId = 'otherId'

      userRepositoryMock.getById.mockResolvedValue(null)

      try {
        // when
        await service.getHistory(loggedId, otherId)
      } catch (e) {
        // then
        expect(e).toBeInstanceOf(NotFoundException)
        expect(e).toMatchObject({
          message: "Not found. Couldn't find user"
        })
        expect(userRepositoryMock.getById).toHaveBeenCalled()
        expect(messageRepositoryMock.getMessageHistory).toHaveBeenCalledTimes(0)
      }
    })
  })
})
