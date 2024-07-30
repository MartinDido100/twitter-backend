import { ReactionService, ReactionServiceImpl } from '@domains/reaction'
import { reactionRepositoryMock } from './reaction.mock'
import { ConflictException } from '@utils'
import { ReactionDTO, ReactionEnum } from '@domains/reaction/dto'

describe('Reaction service tests', () => {
  let service: ReactionService
  beforeEach(() => {
    service = new ReactionServiceImpl(reactionRepositoryMock)
    jest.resetAllMocks()
  })

  describe('reactToPost method', () => {
    it('should create reaction succesfully method successfully', async () => {
      // given
      const loggedId = 'loggedId'
      const postId = 'postId'

      reactionRepositoryMock.checkReaction.mockResolvedValue(false)

      // when
      await service.reactToPost(loggedId, postId, ReactionEnum.LIKE)

      // then
      expect(reactionRepositoryMock.reactToPost).toHaveBeenCalled()
      expect(reactionRepositoryMock.checkReaction).toHaveBeenCalled()
    })

    it('should throw ConflictException if the post has already been reacted', async () => {
      // given
      const loggedId = 'loggedId'
      const postId = 'postId'

      reactionRepositoryMock.checkReaction.mockResolvedValue(true)

      try {
        // when
        await service.reactToPost(loggedId, postId, ReactionEnum.LIKE)
      } catch (e) {
        // then
        expect(e).toBeInstanceOf(ConflictException)
        expect(e).toMatchObject({
          message: 'Conflict',
          error: {
            error_code: 'LIKE_ALREADY_EXISTS'
          }
        })
        expect(reactionRepositoryMock.reactToPost).toHaveBeenCalledTimes(0)
        expect(reactionRepositoryMock.checkReaction).toHaveBeenCalled()
      }
    })
  })

  describe('deleteReaction method', () => {
    it('should delete reaction successfully', async () => {
      // given
      const loggedId = 'loggedId'
      const postId = 'postId'

      reactionRepositoryMock.checkReaction.mockResolvedValue(true)

      // when
      await service.deleteReaction(loggedId, postId, ReactionEnum.RETWEET)

      // then
      expect(reactionRepositoryMock.deleteReaction).toHaveBeenCalled()
      expect(reactionRepositoryMock.checkReaction).toHaveBeenCalled()
    })

    it('should throw ConflictException if the post has not been reacted', async () => {
      // given
      const loggedId = 'loggedId'
      const postId = 'postId'

      reactionRepositoryMock.checkReaction.mockResolvedValue(false)

      try {
        // when
        await service.deleteReaction(loggedId, postId, ReactionEnum.RETWEET)
      } catch (e) {
        // then
        expect(e).toBeInstanceOf(ConflictException)
        expect(e).toMatchObject({
          message: 'Conflict',
          error: {
            error_code: 'RETWEET_NOT_EXISTS'
          }
        })
        expect(reactionRepositoryMock.deleteReaction).toHaveBeenCalledTimes(0)
        expect(reactionRepositoryMock.checkReaction).toHaveBeenCalled()
      }
    })
  })

  describe('getLikes method', () => {
    it('should successfully return an array of likes', async () => {
      // given
      const loggedId = 'loggedId'

      reactionRepositoryMock.getLikes.mockResolvedValue([
        {
          id: 'reactionId',
          userId: loggedId,
          postId: 'postId1',
          type: ReactionEnum.LIKE
        },
        {
          id: 'reactionId2',
          userId: loggedId,
          postId: 'postId2',
          type: ReactionEnum.LIKE
        }
      ])

      const expected: ReactionDTO[] = [
        {
          id: 'reactionId',
          userId: loggedId,
          postId: 'postId1',
          type: 'LIKE'
        },
        {
          id: 'reactionId2',
          userId: loggedId,
          postId: 'postId2',
          type: 'LIKE'
        }
      ]

      // when
      const result = await service.getLikes(loggedId)

      // then
      expect(result).toEqual(expected)
      expect(reactionRepositoryMock.getLikes).toHaveBeenCalled()
    })
  })

  describe('getLikes retweets', () => {
    it('should successfully return an array of retweets', async () => {
      // given
      const loggedId = 'loggedId'

      reactionRepositoryMock.getRetweets.mockResolvedValue([
        {
          id: 'reactionId',
          userId: loggedId,
          postId: 'postId1',
          type: ReactionEnum.RETWEET
        },
        {
          id: 'reactionId2',
          userId: loggedId,
          postId: 'postId2',
          type: ReactionEnum.RETWEET
        }
      ])

      const expected: ReactionDTO[] = [
        {
          id: 'reactionId',
          userId: loggedId,
          postId: 'postId1',
          type: 'RETWEET'
        },
        {
          id: 'reactionId2',
          userId: loggedId,
          postId: 'postId2',
          type: 'RETWEET'
        }
      ]

      // when
      const result = await service.getRetweets(loggedId)

      // then
      expect(result).toEqual(expected)
      expect(reactionRepositoryMock.getRetweets).toHaveBeenCalled()
    })
  })
})
