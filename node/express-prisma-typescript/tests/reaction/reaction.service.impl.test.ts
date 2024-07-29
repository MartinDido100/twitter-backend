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

  describe('like method', () => {
    it('should call like method successfully', async () => {
      // given
      const loggedId = 'loggedId'
      const postId = 'postId'

      reactionRepositoryMock.checkLike.mockResolvedValue(false)

      // when
      await service.like(loggedId, postId)

      // then
      expect(reactionRepositoryMock.like).toHaveBeenCalled()
      expect(reactionRepositoryMock.checkLike).toHaveBeenCalled()
    })

    it('should throw ConflictException if the post has already been liked', async () => {
      // given
      const loggedId = 'loggedId'
      const postId = 'postId'

      reactionRepositoryMock.checkLike.mockResolvedValue(true)

      try {
        // when
        await service.like(loggedId, postId)
      } catch (e) {
        // then
        expect(e).toBeInstanceOf(ConflictException)
        expect(e).toMatchObject({
          message: 'Conflict',
          error: {
            error_code: 'ALREADY_LIKED'
          }
        })
        expect(reactionRepositoryMock.like).toHaveBeenCalledTimes(0)
        expect(reactionRepositoryMock.checkLike).toHaveBeenCalled()
      }
    })
  })

  describe('dislike method', () => {
    it('should call dislike method successfully', async () => {
      // given
      const loggedId = 'loggedId'
      const postId = 'postId'

      reactionRepositoryMock.checkLike.mockResolvedValue(true)

      // when
      await service.dislike(loggedId, postId)

      // then
      expect(reactionRepositoryMock.dislike).toHaveBeenCalled()
      expect(reactionRepositoryMock.checkLike).toHaveBeenCalled()
    })

    it('should throw ConflictException if the post has not been liked', async () => {
      // given
      const loggedId = 'loggedId'
      const postId = 'postId'

      reactionRepositoryMock.checkLike.mockResolvedValue(false)

      try {
        // when
        await service.dislike(loggedId, postId)
      } catch (e) {
        // then
        expect(e).toBeInstanceOf(ConflictException)
        expect(e).toMatchObject({
          message: 'Conflict',
          error: {
            error_code: 'NOT_LIKED'
          }
        })
        expect(reactionRepositoryMock.dislike).toHaveBeenCalledTimes(0)
        expect(reactionRepositoryMock.checkLike).toHaveBeenCalled()
      }
    })
  })

  describe('retweet method', () => {
    it('should call retweet method successfully', async () => {
      // given
      const loggedId = 'loggedId'
      const postId = 'postId'

      reactionRepositoryMock.checkRetweet.mockResolvedValue(false)

      // when
      await service.retweet(loggedId, postId)

      // then
      expect(reactionRepositoryMock.retweet).toHaveBeenCalled()
      expect(reactionRepositoryMock.checkRetweet).toHaveBeenCalled()
    })

    it('should throw ConflictException if the post has already been retweeted', async () => {
      // given
      const loggedId = 'loggedId'
      const postId = 'postId'

      reactionRepositoryMock.checkRetweet.mockResolvedValue(true)

      try {
        // when
        await service.retweet(loggedId, postId)
      } catch (e) {
        // then
        expect(e).toBeInstanceOf(ConflictException)
        expect(e).toMatchObject({
          message: 'Conflict',
          error: {
            error_code: 'ALREADY_RETWEETED'
          }
        })
        expect(reactionRepositoryMock.retweet).toHaveBeenCalledTimes(0)
        expect(reactionRepositoryMock.checkRetweet).toHaveBeenCalled()
      }
    })
  })

  describe('unretweet method', () => {
    it('should call unretweet method successfully', async () => {
      // given
      const loggedId = 'loggedId'
      const postId = 'postId'

      reactionRepositoryMock.checkRetweet.mockResolvedValue(true)

      // when
      await service.unretweet(loggedId, postId)

      // then
      expect(reactionRepositoryMock.unretweet).toHaveBeenCalled()
      expect(reactionRepositoryMock.checkRetweet).toHaveBeenCalled()
    })

    it('should throw ConflictException if the post has not been retweeted', async () => {
      // given
      const loggedId = 'loggedId'
      const postId = 'postId'

      reactionRepositoryMock.checkRetweet.mockResolvedValue(false)

      try {
        // when
        await service.unretweet(loggedId, postId)
      } catch (e) {
        // then
        expect(e).toBeInstanceOf(ConflictException)
        expect(e).toMatchObject({
          message: 'Conflict',
          error: {
            error_code: 'NOT_RETWEETED'
          }
        })
        expect(reactionRepositoryMock.unretweet).toHaveBeenCalledTimes(0)
        expect(reactionRepositoryMock.checkRetweet).toHaveBeenCalled()
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
