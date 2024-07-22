import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import { NextFunction, Request, Response } from 'express'
import { Constants } from '@utils'
import { UnauthorizedException } from '@utils/errors'
import { Socket } from 'socket.io'

export const generateAccessToken = (payload: Record<string, string | boolean | number>): string => {
  // Do not use this in production, the token will last 24 hours
  // For production apps, use a 15-minute token with a refresh token stored in a HttpOnly Cookie
  return jwt.sign(payload, Constants.TOKEN_SECRET, { expiresIn: '24h' })
}

export const withAuth = (req: Request, res: Response, next: NextFunction): void => {
  // Get the token from the authorization header
  const [bearer, token] = (req.headers.authorization)?.split(' ') ?? []
  // Verify that the Authorization header has the expected shape
  if (!bearer || !token || bearer !== 'Bearer') throw new UnauthorizedException('MISSING_TOKEN')

  // Verify that the token is valid
  jwt.verify(token, Constants.TOKEN_SECRET, (err, context) => {
    if (err) throw new UnauthorizedException('INVALID_TOKEN')
    res.locals.context = context
    next()
  })
}

export const socketAuth = (socket: Socket, next: (err?: any) => any): void => {
  const [bearer, token] = (socket.handshake.headers.authorization)?.split(' ') ?? []

  if (!bearer || !token || bearer !== 'Bearer') next(new UnauthorizedException('MISSING_TOKEN'))

  jwt.verify(token, Constants.TOKEN_SECRET, (err, context) => {
    if (err) next(new UnauthorizedException('INVALID_TOKEN'))
    socket.data.context = context
    next()
  })
}

export const encryptPassword = async (password: string): Promise<string> => {
  return await bcrypt.hash(password, 10)
}

export const checkPassword = async (password: string, hash: string): Promise<boolean> => {
  return await bcrypt.compare(password, hash)
}
