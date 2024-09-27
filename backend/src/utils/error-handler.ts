import { FastifyInstance } from 'fastify'
import { ZodError } from 'zod'

import { BadRequestError } from '../_errors'
import { Logger } from './logger'

type FastifyErrorHandler = FastifyInstance['errorHandler']

export const errorHandler: FastifyErrorHandler = function (
  error,
  _request,
  reply,
) {
  const { validation, validationContext } = error
  const logger: Logger = new Logger(`ErrorHandler`);

  if (validation) {
    return reply.status(error.statusCode ?? 400).send({
      message: `Error validating request ${validationContext}`,
      errors: validation,
    })
  }

  if (error instanceof BadRequestError) {
    return reply.status(400).send({
      message: error.message,
    })
  }

  if (error instanceof ZodError) {
    return reply.status(error.statusCode ?? 400).send({
      message: error.issues
        .map((e) => `${e.path.join('.')}: ${e.message}`)
        .join('\n'),
    })
  }

  logger.error(`${(error as Error).message}`)

  return reply.status(500).send({ message: 'Internal server error.' })
}