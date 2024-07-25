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
      const userId = '123'
      const loggedUserId = '456'
      userRepositoryMock.getById.mockResolvedValue({ id: userId, profilePicture: null, username: 'username', name: 'name' })
      followRepositoryMock.checkFollow.mockResolvedValue(false)
      const expected: ExtendedUserViewDTO = { id: userId, profilePicture: null, username: 'username', name: 'name', followsYou: false }
      // when
      const result = await userService.getUser(loggedUserId, userId)
      // then
      expect(expected.id).toEqual(result.id)
      expect(expected.profilePicture).toBeNull()
      expect(expected.username).toEqual(result.username)
      expect(expected.name).toEqual(result.name)
      expect(result).toEqual(expected)
    })

    it('should call checkFollow', async () => {
      // given
      const userId = '123'
      const loggedUserId = '456'
      userRepositoryMock.getById.mockResolvedValue({ id: userId, profilePicture: null, username: 'username', name: 'name' })
      followRepositoryMock.checkFollow.mockResolvedValue(false)
      // when
      await userService.getUser(loggedUserId, userId)
      // then
      expect(followRepositoryMock.checkFollow).toHaveBeenCalledTimes(1)
    })

    it('should call getImage 0 times if profilePicture is null', async () => {
      // given
      const userId = '123'
      const loggedUserId = '456'
      userRepositoryMock.getById.mockResolvedValue({ id: userId, profilePicture: null, username: 'username', name: 'name' })
      followRepositoryMock.checkFollow.mockResolvedValue(false)
      // when
      await userService.getUser(loggedUserId, userId)
      // then
      expect(bucketManagerMock.getImage).toHaveBeenCalledTimes(0)
    })

    it('should call getImage 1 time if profilePicture is not null', async () => {
      // given
      const userId = '123'
      const loggedUserId = '456'
      userRepositoryMock.getById.mockResolvedValue({ id: userId, profilePicture: 'prrofilepicPath.jpg', username: 'username', name: 'name' })
      followRepositoryMock.checkFollow.mockResolvedValue(false)
      // when
      await userService.getUser(loggedUserId, userId)
      // then
      expect(bucketManagerMock.getImage).toHaveBeenCalledTimes(1)
    })

    it('should throw a NotFoundException if user does not exist', async () => {
      // given
      const userId = '123'
      const loggedUserId = '456'

      userRepositoryMock.getById.mockResolvedValue(null)
      // when
      try {
        await userService.getUser(loggedUserId, userId)
      } catch (e) {
        // then
        expect(e).toBeInstanceOf(NotFoundException)
        expect(e).toMatchObject({ message: "Not found. Couldn't find user" })
      }
    })
  })

  describe('getLoggedUser method', () => {
    it('should return a ExtendedUserView', async () => {
      // given
      const userId = '123'
      userRepositoryMock.getById.mockResolvedValue({ id: userId, profilePicture: null, username: 'username', name: 'name' })
      const expected: UserViewDTO = { id: userId, profilePicture: null, username: 'username', name: 'name' }
      // when
      const result = await userService.getLoggedUser(userId)
      // then
      expect(expected.id).toEqual(result.id)
      expect(expected.profilePicture).toBeNull()
      expect(expected.username).toEqual(result.username)
      expect(expected.name).toEqual(result.name)
      expect(result).toEqual(expected)
    })

    it('should call getImage 0 times if profilePicture is null', async () => {
      // given
      const userId = '123'
      const loggedUserId = '456'
      userRepositoryMock.getById.mockResolvedValue({ id: userId, profilePicture: null, username: 'username', name: 'name' })
      followRepositoryMock.checkFollow.mockResolvedValue(false)
      // when
      await userService.getUser(loggedUserId, userId)
      // then
      expect(bucketManagerMock.getImage).toHaveBeenCalledTimes(0)
    })

    it('should call getImage 1 time if profilePicture is not null', async () => {
      // given
      const userId = '123'
      const loggedUserId = '456'
      userRepositoryMock.getById.mockResolvedValue({ id: userId, profilePicture: 'prrofilepicPath.jpg', username: 'username', name: 'name' })
      followRepositoryMock.checkFollow.mockResolvedValue(false)
      // when
      await userService.getUser(loggedUserId, userId)
      // then
      expect(bucketManagerMock.getImage).toHaveBeenCalledTimes(1)
    })

    it('should throw a NotFoundException if user does not exist', async () => {
      // given
      const userId = '123'
      userRepositoryMock.getById.mockResolvedValue(null)
      // when
      
      try {
        await userService.getLoggedUser(userId)
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
      const userId = '123'
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
      expect(result.length).toEqual(expected.length)
    })

    it('should call getImage every timee profilePicture is not null', async () => {
      // given
      const userId = '123'
      const options = { limit: 10, offset: 0 }

      userRepositoryMock.getRecommendedUsersPaginated.mockResolvedValue([
        { id: '456', profilePicture: null, username: 'username1', name: 'name1' },
        { id: '789', profilePicture: 'prrofilepicPath.jpg', username: 'username2', name: 'name2' },
        { id: 'userid1221', profilePicture: 'profilepic2.jpg', username: 'username1', name: 'name1' }
      ])

      bucketManagerMock.getImage.mockResolvedValue('imageUrl')
      // when
      await userService.getUserRecommendations(userId, options)
      // then
      expect(bucketManagerMock.getImage).toHaveBeenCalledTimes(2)
    })
  })

  describe('updateProfilePicture method', () => {
    it('should return a profile picture url', async () => {
      // given
      const userId = '123'
      const extension = 'jpg'
      userRepositoryMock.updateProfilePicture.mockResolvedValue(`profile/${userId}.${extension}`)
      bucketManagerMock.putImage.mockResolvedValue('imageUrl')
      // when
      const result = await userService.updateProfilePicture(userId, extension)
      // then
      expect(result).toEqual('imageUrl')
      expect(typeof result).toBe('string')
    })

    it('should call putImage', async () => {
      // given
      const userId = '123'
      const extension = 'jpg'
      userRepositoryMock.updateProfilePicture.mockResolvedValue(`profile/${userId}.${extension}`)
      bucketManagerMock.putImage.mockResolvedValue('imageUrl')
      // when
      await userService.updateProfilePicture(userId, extension)
      // then
      expect(bucketManagerMock.putImage).toHaveBeenCalledTimes(1)
    })
  })

  describe('getUsersByUsername method', () => {
    it('should return a list of UserViewDTO', async () => {
      // given
      const username = 'username'
      const options = { limit: 10, offset: 0 }

      userRepositoryMock.getByUsernamePaginated.mockResolvedValue([
        { id: '456', profilePicture: null, username: 'username1', name: 'name1' },
        { id: '789', profilePicture: 'profilepicPath.jpg', username: 'username2', name: 'name2' }
      ])

      bucketManagerMock.getImage.mockResolvedValue('imageUrl')

      const expected: UserViewDTO[] = [
        { id: '456', profilePicture: null, username: 'username1', name: 'name1' },
        { id: '789', profilePicture: 'imageUrl', username: 'username2', name: 'name2' }
      ]

      // when
      const result = await userService.getUsersByUsername(username, options)

      // then
      
      expect(result.length).toBe(2)
      expect(result).toEqual(expected)
    })

    it('should call getImage every time profilePicture is not null', async () => {
      // given
      const username = 'username'
      const options = { limit: 10, offset: 0 }

      userRepositoryMock.getByUsernamePaginated.mockResolvedValue([
        { id: '456', profilePicture: null, username: 'username1', name: 'name1' },
        { id: '789', profilePicture: 'profilepicPath.jpg', username: 'username2', name: 'name2' }
      ])

      bucketManagerMock.getImage.mockResolvedValue('imageUrl')

      // when
      await userService.getUsersByUsername(username, options)

      // then
      expect(bucketManagerMock.getImage).toHaveBeenCalledTimes(1)
    })
  })
})
