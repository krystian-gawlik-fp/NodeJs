import Express from 'express'
import ErrorBase from '../errors/errorBase'
import logger from '../util/logger'

export default (
  err: any,
  req: Express.Request,
  res: Express.Response,
  next: any
) => {
  if (err instanceof ErrorBase) {
    return res.status(err.statusCode).json({
      message: err.message
    })
  } else {
    logger.error(err)
    return res.status(500).json({
      message: err.message
    })
  }

  next()
}
