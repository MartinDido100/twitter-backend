import * as auth from '@utils/auth'

export const checkPasswordSpy = jest.spyOn(auth, 'checkPassword')

export const generateTokenSpy = jest.spyOn(auth, 'generateAccessToken')

export const encryptPasswordSpy = jest.spyOn(auth, 'encryptPassword')
