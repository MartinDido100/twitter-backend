import { UserService, UserServiceImpl } from '@domains/user/service'
import { bucketManagerMock, followRepositoryMock, userRepositoryMock } from '../mock'
import { NotFoundException } from '@utils'
import { ExtendedUserViewDTO, UserViewDTO } from '@domains/user/dto'

describe('User service tests', () => {
  let userService: UserService

  beforeEach(() => {
    userService = new UserServiceImpl(userRepositoryMock, bucketManagerMock, followRepositoryMock)
    jest.resetAllMocks()
  })

  describe('getUser method', () => {
    it('should return an ExtendedUserView', async () => {
      // given
      const userId = 'userId'
      const loggedUserId = 'loggedId'
      userRepositoryMock.getById.mockResolvedValue({ id: userId, profilePicture: null, username: 'username', name: 'name' })
      followRepositoryMock.checkFollow.mockResolvedValue(false)
      const expected: ExtendedUserViewDTO = {
        id: userId,
        profilePicture: null,
        username: 'username',
        name: 'name',
        followsYou: false
      }
      // when
      const result = await userService.getUser(loggedUserId, userId)
      // then
      expect(result).toEqual(expected)
      expect(userRepositoryMock.getById).toHaveBeenCalled()
      expect(followRepositoryMock.checkFollow).toHaveBeenCalled()
    })

    it('should call checkFollow', async () => {
      // given
      const userId = 'userId'
      const loggedUserId = 'loggedId'
      userRepositoryMock.getById.mockResolvedValue({ id: userId, profilePicture: null, username: 'username', name: 'name' })
      followRepositoryMock.checkFollow.mockResolvedValue(false)
      // when
      await userService.getUser(loggedUserId, userId)
      // then
      expect(followRepositoryMock.checkFollow).toHaveBeenCalled()
    })

    it('should generate 0 url if profilePicture is null', async () => {
      // given
      const userId = 'userId'
      const loggedUserId = 'loggedId'
      userRepositoryMock.getById.mockResolvedValue({
        id: userId,
        profilePicture: null,
        username: 'username',
        name: 'name'
      })

      followRepositoryMock.checkFollow.mockResolvedValue(false)
      // when
      await userService.getUser(loggedUserId, userId)
      // then
      expect(bucketManagerMock.getImage).toHaveBeenCalledTimes(0)
    })

    it('should generate 1 url if profilePicture is not null', async () => {
      // given
      const userId = 'userId'
      const loggedUserId = 'loggedId'
      userRepositoryMock.getById.mockResolvedValue({
        id: userId,
        profilePicture: 'profilepic.jpg',
        username: 'username',
        name: 'name'
      })

      followRepositoryMock.checkFollow.mockResolvedValue(false)
      // when
      await userService.getUser(loggedUserId, userId)
      // then
      expect(bucketManagerMock.getImage).toHaveBeenCalled()
    })

    it('should throw a NotFoundException if user does not exist', async () => {
      // given
      const userId = 'userId'
      const loggedUserId = 'loggedId'

      userRepositoryMock.getById.mockResolvedValue(null)
      // when
      try {
        await userService.getUser(loggedUserId, userId)
      } catch (e) {
        // then
        expect(e).toBeInstanceOf(NotFoundException)
        expect(e).toMatchObject({ message: "Not found. Couldn't find user" })
        expect(userRepositoryMock.getById).toHaveBeenCalled()
      }
    })
  })

  describe('getLoggedUser method', () => {
    it('should return an ExtendedUserView', async () => {
      // given
      const userId = 'loggedUserId'
      userRepositoryMock.getById.mockResolvedValue({
        id: userId,
        profilePicture: null,
        username: 'username',
        name: 'name'
      })

      const expected: UserViewDTO = {
        id: userId,
        profilePicture: null,
        username: 'username',
        name: 'name'
      }

      // when
      const result = await userService.getLoggedUser(userId)
      // then
      expect(userRepositoryMock.getById).toHaveBeenCalled()
      expect(bucketManagerMock.getImage).toHaveBeenCalledTimes(0)
      expect(result).toEqual(expected)
    })

    it('should generate 0 urls if profilePicture is null', async () => {
      // given
      const loggedUserId = 'loggedId'
      userRepositoryMock.getById.mockResolvedValue({
        id: loggedUserId,
        profilePicture: null,
        username: 'username',
        name: 'name'
      })

      followRepositoryMock.checkFollow.mockResolvedValue(false)
      // when
      await userService.getLoggedUser(loggedUserId)
      // then
      expect(bucketManagerMock.getImage).toHaveBeenCalledTimes(0)
    })

    it('should generate 1 url if profilePicture is not null', async () => {
      // given
      const loggedUserId = 'loggedId'
      userRepositoryMock.getById.mockResolvedValue({
        id: loggedUserId,
        profilePicture: 'profilepic.jpg',
        username: 'username',
        name: 'name'
      })

      followRepositoryMock.checkFollow.mockResolvedValue(false)
      // when
      await userService.getLoggedUser(loggedUserId)
      // then
      expect(bucketManagerMock.getImage).toHaveBeenCalledTimes(1)
    })

    it('should throw a NotFoundException if user does not exist', async () => {
      // given
      const loggedUserId = 'loggedUserId'
      userRepositoryMock.getById.mockResolvedValue(null)
      // when

      try {
        await userService.getLoggedUser(loggedUserId)
      } catch (e) {
        // then
        expect(e).toBeInstanceOf(NotFoundException)
        expect(e).toMatchObject({ message: "Not found. Couldn't find user" })
      }
    })
  })

  describe('getUserRecommendations method', () => {
    it('should return a list of UserViewDTO', async () => {
      // given
      const userId = 'userId'
      const options = { limit: 10, offset: 0 }

      userRepositoryMock.getRecommendedUsersPaginated.mockResolvedValue([
        { id: '456', profilePicture: null, username: 'username1', name: 'name1' },
        { id: '789', profilePicture: 'prrofilepicPath.jpg', username: 'username2', name: 'name2' }
      ])

      bucketManagerMock.getImage.mockResolvedValue('imageUrl')
      const expected: UserViewDTO[] = [
        { id: '456', profilePicture: null, username: 'username1', name: 'name1' },
        { id: '789', profilePicture: 'imageUrl', username: 'username2', name: 'name2' }
      ]
      // when
      const result = await userService.getUserRecommendations(userId, options)
      // then
      expect(result).toEqual(expected)
    })

    it('should call getImage every time profilePicture is not null', async () => {
      // given
      const userId = 'loggedId'
      const options = { limit: 10, offset: 0 }

      userRepositoryMock.getRecommendedUsersPaginated.mockResolvedValue([
        { id: 'userId1', profilePicture: null, username: 'username1', name: 'name1' },
        { id: 'userId2', profilePicture: 'prrofilepic.jpg', username: 'username2', name: 'name2' },
        { id: 'userId3', profilePicture: 'profilepic2.jpg', username: 'username1', name: 'name1' }
      ])
      // when
      await userService.getUserRecommendations(userId, options)
      // then
      expect(bucketManagerMock.getImage).toHaveBeenCalledTimes(2)
    })
  })

  describe('updateProfilePicture method', () => {
    it('should return a profile picture url', async () => {
      // given
      const userId = 'loggedId'
      const extension = 'jpg'
      userRepositoryMock.updateProfilePicture.mockResolvedValue(`profile/${userId}.${extension}`)
      bucketManagerMock.putImage.mockResolvedValue('imageUrl')
      // when
      const result = await userService.updateProfilePicture(userId, extension)
      // then
      expect(result).toEqual('imageUrl')
      expect(bucketManagerMock.putImage).toHaveBeenCalled()
    })
  })

  describe('getUsersByUsername method', () => {
    it('should return a list of UserViewDTO', async () => {
      // given
      const username = 'username'
      const options = { limit: 10, offset: 0 }

      userRepositoryMock.getByUsernamePaginated.mockResolvedValue([
        { id: 'userId1', profilePicture: null, username: 'username1', name: 'name1' },
        { id: 'userId2', profilePicture: 'profilepic.jpg', username: 'username2', name: 'name2' }
      ])

      bucketManagerMock.getImage.mockResolvedValue('imageUrl')

      const expected: UserViewDTO[] = [
        { id: 'userId1', profilePicture: null, username: 'username1', name: 'name1' },
        { id: 'userId2', profilePicture: 'imageUrl', username: 'username2', name: 'name2' }
      ]

      // when
      const result = await userService.getUsersByUsername(username, options)
      // then
      expect(userRepositoryMock.getByUsernamePaginated).toHaveBeenCalled()
      expect(result).toEqual(expected)
    })

    it('should call getImage every time profilePicture is not null', async () => {
      // given
      const username = 'username'
      const options = { limit: 10, offset: 0 }

      userRepositoryMock.getByUsernamePaginated.mockResolvedValue([
        { id: 'userId1', profilePicture: null, username: 'username1', name: 'name1' },
        { id: 'userId2', profilePicture: 'profilepic.jpg', username: 'username2', name: 'name2' }
      ])

      // when
      await userService.getUsersByUsername(username, options)

      // then
      expect(bucketManagerMock.getImage).toHaveBeenCalledTimes(1)
    })
  })
})
