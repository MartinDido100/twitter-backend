import { FollowService, FollowServiceImpl } from '@domains/follow'
import { followRepositoryMock } from '../mock'
import { ConflictException } from '@utils'

describe('Follow service tests', () => {
  let service: FollowService

  beforeEach(() => {
    service = new FollowServiceImpl(followRepositoryMock)
    jest.resetAllMocks()
  })

  describe('followUser method', () => {
    it('should successfully follow the user', async () => {
      // given
      const loggedId = 'loggedId'
      const followUserId = 'followId'

      followRepositoryMock.checkFollow.mockResolvedValue(false)

      // when
      await service.followUser(loggedId, followUserId)

      // then
      expect(followRepositoryMock.followUser).toHaveBeenCalled()
    })

    it('should throw ConfictException if followId is the same as followerId', async () => {
      // given
      const loggedId = 'loggedId'
      const followUserId = 'loggedId'

      try {
        // when
        await service.followUser(loggedId, followUserId)
      } catch (e) {
        // then
        expect(e).toBeInstanceOf(ConflictException)
        expect(e).toMatchObject({
          message: 'Conflict',
          error: {
            error_code: 'CANNOT_FOLLOW_YOURSELF'
          }
        })
        expect(followRepositoryMock.followUser).toHaveBeenCalledTimes(0)
        expect(followRepositoryMock.checkFollow).toHaveBeenCalledTimes(0)
      }
    })

    it('should throw ConfictException if logged user has already following the other user', async () => {
      // given
      const loggedId = 'loggedId'
      const followUserId = 'otherUserId'

      followRepositoryMock.checkFollow.mockResolvedValue(true)

      try {
        // when
        await service.followUser(loggedId, followUserId)
      } catch (e) {
        // then
        expect(e).toBeInstanceOf(ConflictException)
        expect(e).toMatchObject({
          message: 'Conflict',
          error: {
            error_code: 'USER_ALREADY_FOLLOWED'
          }
        })
        expect(followRepositoryMock.followUser).toHaveBeenCalledTimes(0)
        expect(followRepositoryMock.checkFollow).toHaveBeenCalledTimes(1)
      }
    })
  })

  describe('unfollowUser method', () => {
    it('should successfully unfollow the user', async () => {
      // given
      const loggedId = 'loggedId'
      const unfollowUserId = 'followId'

      followRepositoryMock.checkFollow.mockResolvedValue(true)

      // when
      await service.unfollowUser(loggedId, unfollowUserId)

      // then
      expect(followRepositoryMock.unfollowUser).toHaveBeenCalled()
    })

    it('should throw ConfictException if followId is the same as followerId', async () => {
      // given
      const loggedId = 'loggedId'
      const followUserId = 'loggedId'

      try {
        // when
        await service.unfollowUser(loggedId, followUserId)
      } catch (e) {
        // then
        expect(e).toBeInstanceOf(ConflictException)
        expect(e).toMatchObject({
          message: 'Conflict',
          error: {
            error_code: 'CANNOT_UNFOLLOW_YOURSELF'
          }
        })
        expect(followRepositoryMock.unfollowUser).toHaveBeenCalledTimes(0)
        expect(followRepositoryMock.checkFollow).toHaveBeenCalledTimes(0)
      }
    })

    it('should throw ConfictException if logged user has not following the other user', async () => {
      // given
      const loggedId = 'loggedId'
      const followUserId = 'otherUserId'

      followRepositoryMock.checkFollow.mockResolvedValue(false)

      try {
        // when
        await service.unfollowUser(loggedId, followUserId)
      } catch (e) {
        // then
        expect(e).toBeInstanceOf(ConflictException)
        expect(e).toMatchObject({
          message: 'Conflict',
          error: {
            error_code: 'USER_NOT_FOLLOWED'
          }
        })
        expect(followRepositoryMock.unfollowUser).toHaveBeenCalledTimes(0)
        expect(followRepositoryMock.checkFollow).toHaveBeenCalledTimes(1)
      }
    })
  })
})
