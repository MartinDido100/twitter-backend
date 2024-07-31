import { ReactionService, ReactionServiceImpl } from '@domains/reaction'
import { reactionRepositoryMock } from './reaction.mock'
import { ConflictException, NotFoundException } from '@utils'
import { ReactionDTO, ReactionEnum } from '@domains/reaction/dto'
import { followRepositoryMock, postRepositoryMock, userRepositoryMock } from '../mock'

describe('Reaction service tests', () => {
  let service: ReactionService
  beforeEach(() => {
    service = new ReactionServiceImpl(reactionRepositoryMock, userRepositoryMock, followRepositoryMock, postRepositoryMock)
    jest.resetAllMocks()
  })

  describe('reactToPost method', () => {
    it('should create reaction succesfully method successfully', async () => {
      // given
      const loggedId = 'loggedId'
      const postId = 'postId'

      postRepositoryMock.getById.mockResolvedValue({
        id: 'postId',
        content: 'content',
        authorId: 'authorId',
        images: [],
        createdAt: new Date()
      })
      reactionRepositoryMock.checkReaction.mockResolvedValue(false)
      userRepositoryMock.isPrivateUser.mockResolvedValue(false)

      // when
      await service.reactToPost(loggedId, postId, ReactionEnum.LIKE)

      // then
      expect(reactionRepositoryMock.reactToPost).toHaveBeenCalled()
      expect(reactionRepositoryMock.checkReaction).toHaveBeenCalled()
      expect(userRepositoryMock.isPrivateUser).toHaveBeenCalled()
      expect(followRepositoryMock.checkFollow).toHaveBeenCalled()
      expect(postRepositoryMock.getById).toHaveBeenCalled()
    })

    it('should throw ConflictException if the post has already been reacted', async () => {
      // given
      const loggedId = 'loggedId'
      const postId = 'postId'

      postRepositoryMock.getById.mockResolvedValue({
        id: 'postId',
        content: 'content',
        authorId: 'authorId',
        images: [],
        createdAt: new Date()
      })
      reactionRepositoryMock.checkReaction.mockResolvedValue(true)
      userRepositoryMock.isPrivateUser.mockResolvedValue(false)

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

    it('should throw NotFoundException if post to react not exists', async () => {
      const loggedId = 'loggedId'
      const postId = 'postId'

      postRepositoryMock.getById.mockResolvedValue(null)

      try {
        // when
        await service.reactToPost(loggedId, postId, ReactionEnum.LIKE)
      } catch (e) {
        // then
        expect(e).toBeInstanceOf(NotFoundException)
        expect(e).toMatchObject({
          message: "Not found. Couldn't find post"
        })
        expect(reactionRepositoryMock.reactToPost).toHaveBeenCalledTimes(0)
        expect(reactionRepositoryMock.checkReaction).toHaveBeenCalledTimes(0)
        expect(userRepositoryMock.isPrivateUser).toHaveBeenCalledTimes(0)
        expect(followRepositoryMock.checkFollow).toHaveBeenCalledTimes(0)
      }
    })

    it('should throw NotFoundException author is pirvate and logged user is not following him', async () => {
      // given
      const loggedId = 'loggedId'
      const postId = 'postId'

      postRepositoryMock.getById.mockResolvedValue({
        id: 'postId',
        content: 'content',
        authorId: 'authorId',
        images: [],
        createdAt: new Date()
      })
      userRepositoryMock.isPrivateUser.mockResolvedValue(true)
      followRepositoryMock.checkFollow.mockResolvedValue(false)

      try {
        // when
        await service.reactToPost(loggedId, postId, ReactionEnum.LIKE)
      } catch (e) {
        // then
        expect(e).toBeInstanceOf(NotFoundException)
        expect(e).toMatchObject({
          message: "Not found. Couldn't find post"
        })
        expect(reactionRepositoryMock.reactToPost).toHaveBeenCalledTimes(0)
        expect(reactionRepositoryMock.checkReaction).toHaveBeenCalledTimes(0)
        expect(userRepositoryMock.isPrivateUser).toHaveBeenCalled()
        expect(followRepositoryMock.checkFollow).toHaveBeenCalled()
      }
    })
  })

  describe('deleteReaction method', () => {
    it('should delete reaction successfully', async () => {
      // given
      const loggedId = 'loggedId'
      const postId = 'postId'

      postRepositoryMock.getById.mockResolvedValue({
        id: 'postId',
        content: 'content',
        authorId: 'authorId',
        images: [],
        createdAt: new Date()
      })
      userRepositoryMock.isPrivateUser.mockResolvedValue(false)
      reactionRepositoryMock.checkReaction.mockResolvedValue(true)

      // when
      await service.deleteReaction(loggedId, postId, ReactionEnum.RETWEET)

      // then
      expect(reactionRepositoryMock.deleteReaction).toHaveBeenCalled()
      expect(reactionRepositoryMock.checkReaction).toHaveBeenCalled()
      expect(userRepositoryMock.isPrivateUser).toHaveBeenCalled()
      expect(followRepositoryMock.checkFollow).toHaveBeenCalled()
      expect(postRepositoryMock.getById).toHaveBeenCalled()
    })

    it('should throw ConflictException if the post has not been reacted', async () => {
      // given
      const loggedId = 'loggedId'
      const postId = 'postId'

      postRepositoryMock.getById.mockResolvedValue({
        id: 'postId',
        content: 'content',
        authorId: 'authorId',
        images: [],
        createdAt: new Date()
      })
      userRepositoryMock.isPrivateUser.mockResolvedValue(false)
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
        expect(userRepositoryMock.isPrivateUser).toHaveBeenCalled()
        expect(followRepositoryMock.checkFollow).toHaveBeenCalled()
        expect(postRepositoryMock.getById).toHaveBeenCalled()
      }
    })

    it('should throw NotFoundException if post to delete reaction not exists', async () => {
      // given
      const loggedId = 'loggedId'
      const postId = 'postId'

      postRepositoryMock.getById.mockResolvedValue(null)

      try {
        // when
        await service.deleteReaction(loggedId, postId, ReactionEnum.RETWEET)
      } catch (e) {
        // then
        expect(e).toBeInstanceOf(NotFoundException)
        expect(e).toMatchObject({
          message: "Not found. Couldn't find post"
        })
        expect(reactionRepositoryMock.deleteReaction).toHaveBeenCalledTimes(0)
        expect(reactionRepositoryMock.checkReaction).toHaveBeenCalledTimes(0)
        expect(userRepositoryMock.isPrivateUser).toHaveBeenCalledTimes(0)
        expect(followRepositoryMock.checkFollow).toHaveBeenCalledTimes(0)
        expect(postRepositoryMock.getById).toHaveBeenCalled()
      }
    })

    it('should throw NotFoundException if author is private and logged user is not following him', async () => {
      // given
      const loggedId = 'loggedId'
      const postId = 'postId'

      postRepositoryMock.getById.mockResolvedValue({
        id: 'postId',
        content: 'content',
        authorId: 'authorId',
        images: [],
        createdAt: new Date()
      })
      userRepositoryMock.isPrivateUser.mockResolvedValue(true)
      followRepositoryMock.checkFollow.mockResolvedValue(false)

      try {
        // when
        await service.deleteReaction(loggedId, postId, ReactionEnum.RETWEET)
      } catch (e) {
        // then
        expect(e).toBeInstanceOf(NotFoundException)
        expect(e).toMatchObject({
          message: "Not found. Couldn't find post"
        })
        expect(reactionRepositoryMock.deleteReaction).toHaveBeenCalledTimes(0)
        expect(reactionRepositoryMock.checkReaction).toHaveBeenCalledTimes(0)
        expect(userRepositoryMock.isPrivateUser).toHaveBeenCalled()
        expect(followRepositoryMock.checkFollow).toHaveBeenCalled()
        expect(postRepositoryMock.getById).toHaveBeenCalled()
      }
    })
  })

  describe('getLikes method', () => {
    it('should successfully return an array of likes', async () => {
      // given
      const userId = 'userId'

      userRepositoryMock.getById.mockResolvedValue({
        id: userId,
        name: 'name',
        username: 'username',
        profilePicture: null
      })

      reactionRepositoryMock.getLikes.mockResolvedValue([
        {
          id: 'reactionId',
          userId,
          postId: 'postId1',
          type: ReactionEnum.LIKE
        },
        {
          id: 'reactionId2',
          userId,
          postId: 'postId2',
          type: ReactionEnum.LIKE
        }
      ])

      const expected: ReactionDTO[] = [
        {
          id: 'reactionId',
          userId,
          postId: 'postId1',
          type: 'LIKE'
        },
        {
          id: 'reactionId2',
          userId,
          postId: 'postId2',
          type: 'LIKE'
        }
      ]

      // when
      const result = await service.getLikes(userId)

      // then
      expect(result).toEqual(expected)
      expect(reactionRepositoryMock.getLikes).toHaveBeenCalled()
    })

    it('should throw NotFoundException if user to query likes not exists', async () => {
      // given
      const userId = 'userId'

      userRepositoryMock.getById.mockResolvedValue(null)

      try {
        // when
        await service.getLikes(userId)
      } catch (e) {
        // then
        expect(e).toBeInstanceOf(NotFoundException)
        expect(e).toMatchObject({
          message: "Not found. Couldn't find user"
        })
        expect(reactionRepositoryMock.getLikes).toHaveBeenCalledTimes(0)
        expect(userRepositoryMock.getById).toHaveBeenCalled()
      }
    })
  })

  describe('getLikes retweets', () => {
    it('should successfully return an array of retweets', async () => {
      // given
      const userId = 'userId'

      userRepositoryMock.getById.mockResolvedValue({
        id: userId,
        name: 'name',
        username: 'username',
        profilePicture: null
      })

      reactionRepositoryMock.getRetweets.mockResolvedValue([
        {
          id: 'reactionId',
          userId,
          postId: 'postId1',
          type: ReactionEnum.RETWEET
        },
        {
          id: 'reactionId2',
          userId,
          postId: 'postId2',
          type: ReactionEnum.RETWEET
        }
      ])

      const expected: ReactionDTO[] = [
        {
          id: 'reactionId',
          userId,
          postId: 'postId1',
          type: 'RETWEET'
        },
        {
          id: 'reactionId2',
          userId,
          postId: 'postId2',
          type: 'RETWEET'
        }
      ]

      // when
      const result = await service.getRetweets(userId)

      // then
      expect(result).toEqual(expected)
      expect(reactionRepositoryMock.getRetweets).toHaveBeenCalled()
    })

    it('should throw NotFoundException if user to query retweets not exists', async () => {
      // given
      const userId = 'userId'

      userRepositoryMock.getById.mockResolvedValue(null)

      try {
        // when
        await service.getRetweets(userId)
      } catch (e) {
        // then
        expect(e).toBeInstanceOf(NotFoundException)
        expect(e).toMatchObject({
          message: "Not found. Couldn't find user"
        })
        expect(reactionRepositoryMock.getRetweets).toHaveBeenCalledTimes(0)
        expect(userRepositoryMock.getById).toHaveBeenCalled()
      }
    })
  })
})
