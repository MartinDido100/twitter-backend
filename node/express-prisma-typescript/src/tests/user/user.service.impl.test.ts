import { UserServiceImpl } from '@domains/user/service'
import { bucketManagerMock, followRepositoryMock, userRepositoryMock } from '../mock'

const userService = new UserServiceImpl(userRepositoryMock, bucketManagerMock, followRepositoryMock)
beforeEach(() => {
  jest.resetAllMocks()
})

describe('getUser method', () => {
  test('should return a user', async () => {
    // given
    const userId = '123'
    const loggedUserId = '456'
    userRepositoryMock.getById.mockResolvedValue({ id: userId, profilePicture: null, username: 'username', name: 'name' })
    const expected = { id: userId, profilePicture: null, username: 'username', name: 'name' }
    // when
    const result = await userService.getUser(loggedUserId, userId)
    // then
    expect(expected.id).toEqual(result.id)
    expect(expected.profilePicture).toEqual(result.profilePicture)
    expect(expected.username).toEqual(result.username)
    expect(expected.name).toEqual(result.name)
    expect(result).toEqual(expected)
  })
})
