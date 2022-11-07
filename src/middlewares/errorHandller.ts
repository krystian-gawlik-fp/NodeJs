import Express from 'express'
import ErrorBase from '../errors/errorBase'

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
    return res.status(500).json({
      message: err.message
    })
  }

  next()
}
