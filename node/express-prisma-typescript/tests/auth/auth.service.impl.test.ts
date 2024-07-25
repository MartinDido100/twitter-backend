import { SignupInputDTO } from '@domains/auth/dto'
import { AuthService, AuthServiceImpl } from '@domains/auth/service'
import { ConflictException, NotFoundException, UnauthorizedException } from '@utils'
import { userRepositoryMock } from '../mock'
import { checkPasswordSpy, encryptPasswordSpy, generateTokenSpy } from './auth.mock'

describe('Auth tests', () => {
  let service: AuthService

  beforeEach(() => {
    service = new AuthServiceImpl(userRepositoryMock)
    jest.resetAllMocks()
  })

  describe('signup method', () => {
    it('should return a token', async () => {
      // given
      const input: SignupInputDTO = {
        email: 'email@email.com',
        username: 'username',
        password: 'password'
      }

      userRepositoryMock.getByEmailOrUsername.mockResolvedValue(null)
      userRepositoryMock.create.mockResolvedValue({ id: 'userId', name: null, createdAt: new Date(), profilePicture: null })

      // when
      const result = await service.signup(input)

      // then
      expect(encryptPasswordSpy).toHaveBeenCalledTimes(1)
      expect(generateTokenSpy).toHaveBeenCalledTimes(1)
      expect(result).toHaveProperty('token')
    })

    it('should throw a ConflictException', async () => {
      // given
      const input = {
        email: 'email@email.com',
        username: 'username',
        password: 'password'
      }

      userRepositoryMock.getByEmailOrUsername.mockResolvedValue({ id: 'userId', name: null, createdAt: new Date(), profilePicture: null, email: input.email, username: input.username, password: 'encryptedPassword' })

      try {
        await service.signup(input)
      } catch (e) {
        expect(e).toBeInstanceOf(ConflictException)
        expect(e).toMatchObject({
          message: 'Conflict',
          error: { error_code: 'USER_ALREADY_EXISTS' }
        })
      }
    })
  })

  describe('login method', () => {
    it('should return a token', async () => {
      // given
      checkPasswordSpy.mockResolvedValue(true)

      const input = {
        email: 'email@email.com',
        username: 'username',
        password: 'password'
      }

      userRepositoryMock.getByEmailOrUsername.mockResolvedValue({
        id: 'userId',
        name: null,
        createdAt: new Date(),
        profilePicture: null,
        email: input.email,
        username: input.username,
        password: 'encryptedPassword'
      })

      // when
      const result = await service.login(input)

      // then
      expect(checkPasswordSpy).toHaveBeenCalledTimes(1)
      expect(result).toHaveProperty('token')
    })

    it('should throw NotFoundException if user was not found', async () => {
      // given
      const input = {
        email: 'email@email.com',
        username: 'username',
        password: 'password'
      }

      userRepositoryMock.getByEmailOrUsername.mockResolvedValue(null)

      try {
        // when
        await service.login(input)
      } catch (e) {
        // then
        expect(e).toBeInstanceOf(NotFoundException)
        expect(e).toMatchObject({ message: "Not found. Couldn't find user" })
      }
    })

    it('should throw UnauthorizedException if password is incorrect', async () => {
      // given
      const input = {
        email: 'email@email.com',
        username: 'username',
        password: 'password'
      }

      checkPasswordSpy.mockResolvedValue(false)

      userRepositoryMock.getByEmailOrUsername.mockResolvedValue({
        id: 'userId',
        name: null,
        createdAt: new Date(),
        profilePicture: null,
        email: input.email,
        username: input.username,
        password: 'encryptedPassword'
      })

      try {
        // when
        await service.login(input)
      } catch (e) {
        // then
        expect(e).toBeInstanceOf(UnauthorizedException)
        expect(e).toMatchObject({
          message: 'Unauthorized. You must login to access this content.',
          error: { error_code: 'INCORRECT_PASSWORD' }
        })
      }
    })
  })
})
