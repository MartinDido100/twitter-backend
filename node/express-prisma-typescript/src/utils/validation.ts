import { validate } from 'class-validator'
import { NextFunction, Request, Response } from 'express'
import { ValidationException } from './errors'
import { plainToInstance } from 'class-transformer'
import { ClassType } from '@types'

export function BodyValidation<T> (target: ClassType<T>) {
  return async (req: Request, res: Response, next: NextFunction) => {
    req.body = plainToInstance(target, req.body)
    const errors = await validate(req.body, {
      whitelist: true,
      forbidNonWhitelisted: true
    })

    if (errors.length > 0) { throw new ValidationException(errors.map(error => ({ ...error, target: undefined, value: undefined }))) }

    next()
  }
}

export function imagesExtensionValidation () {
  return (req: Request, res: Response, next: NextFunction) => {
    const regExp = /\.(jpg|jpeg|png)$/i
    req.body.images?.forEach((image: string) => {
      if (!regExp.test(image)) throw new ValidationException([{ message: 'File extension not allowed', property: 'images' }])
    })

    next()
  }
}
