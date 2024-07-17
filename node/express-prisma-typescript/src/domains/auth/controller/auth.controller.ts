import { Request, Response, Router } from 'express'
import HttpStatus from 'http-status'
// express-async-errors is a module that handles async errors in express, don't forget import it in your new controllers
import 'express-async-errors'

import { db, BodyValidation } from '@utils'
import { UserRepositoryImpl } from '@domains/user/repository'

import { AuthService, AuthServiceImpl } from '../service'
import { LoginInputDTO, SignupInputDTO } from '../dto'

export const authRouter = Router()

// Use dependency injection
const service: AuthService = new AuthServiceImpl(new UserRepositoryImpl(db))

/**
 * @openapi
 *
 * /auth/signup:
 *   post:
 *     summary: Register a new user.
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: The email of the user (must be a valid email).
 *                 example: "email@gmail.com"
 *               username:
 *                 type: string
 *                 description: The username of the user.
 *                 example: "username"
 *               password:
 *                 type: string
 *                 description: The password of the user (must be at least 6 characters long, has lower and upper case characters, a number, and a symbol).
 *                 example: "Password1!"
 *     responses:
 *       201:
 *         description: Returns the token of the created user.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxLCJpYXQiOjE2MjYwNjIwNzEsImV4cCI6MTYyNjA2NTY3MX0.1"
 *       409:
 *         description: Returns an error if the user already exists.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error_code:
 *                   type: string
 *                   example: "USER_ALREADY_EXISTS"
 *       400:
 *         description: Returns an error that means bad request error (invalid email format, weak password, incomplete body).
 */
authRouter.post('/signup', BodyValidation(SignupInputDTO), async (req: Request, res: Response) => {
  const data = req.body

  const token = await service.signup(data)

  return res.status(HttpStatus.CREATED).json(token)
})

/**
 * @openapi
 *
 * /auth/login:
 *   post:
 *     summary: Login an user.
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: The email of the user.
 *                 example: "email@gmail.com"
 *               username:
 *                 type: string
 *                 description: The username of the user.
 *                 example: "username"
 *               password:
 *                 type: string
 *                 description: The password of the user.
 *                 example: "Password1!"
 *     responses:
 *       200:
 *         description: Returns the token of the logged user.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxLCJpYXQiOjE2MjYwNjIwNzEsImV4cCI6MTYyNjA2NTY3MX0.1"
 *       404:
 *         description: Returns an error if the user provided doesn't exist.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Not found. Couldn't find user"
 *                 code:
 *                  type: number
 *                  example: 404
 *       400:
 *         description: Returns an error that means bad request (invalid email format, weak password, incomplete body).
 */
authRouter.post('/login', BodyValidation(LoginInputDTO), async (req: Request, res: Response) => {
  const data = req.body

  const token = await service.login(data)

  return res.status(HttpStatus.OK).json(token)
})
