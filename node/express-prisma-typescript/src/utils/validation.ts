import { validate, ValidationError } from 'class-validator'
import { NextFunction, Request, Response } from 'express'
import { ValidationException } from './errors'
import { plainToInstance } from 'class-transformer'
import { ClassType } from '@types'

async function validateClass<T> (target: ClassType<T>, body: any): Promise<ValidationError[]> {
  body = plainToInstance(target, body)
  return await validate(body, {
    whitelist: true,
    forbidNonWhitelisted: true
  })
}

export function BodyValidation<T> (target: ClassType<T>) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const errors = await validateClass(target, req.body)

    if (errors.length > 0) { throw new ValidationException(errors.map(error => ({ ...error, target: undefined, value: undefined }))) }

    next()
  }
}

export async function validateSocketInput<T> (target: ClassType<T>, input: any): Promise<ValidationException | null> {
  const errors = await validateClass(target, input)

  if (errors.length > 0) { return new ValidationException(errors.map(error => ({ ...error, target: undefined, value: undefined }))) }

  return null
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
