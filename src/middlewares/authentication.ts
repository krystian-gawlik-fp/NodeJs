import * as express from 'express'
import * as jwt from 'jsonwebtoken'
import { JwtAuthPayload } from '../models/jwtAuthPayload'
import Error401 from '../errors/error401'
import Error403 from '../errors/error403'

export async function expressAuthentication(
  request: express.Request,
  securityName: string,
  scopes?: string[]
): Promise<JwtAuthPayload> {
  const token =
    request.body.token ||
    request.query.token ||
    request.headers['authorization']

  if (!token) {
    throw new Error401('No token provided')
  }

  if (!process.env.JWT_SECRET) {
    throw new Error('JWT configuration missing')
  }

  let decodedToken
  try {
    decodedToken = jwt.verify(token, process.env.JWT_SECRET) as JwtAuthPayload
  } catch {
    throw new Error401('Token not verified')
  }

  if (decodedToken) {
    if (scopes?.includes(decodedToken.role.toString())) {
      return decodedToken
    } else {
      throw new Error403("User don't have required role")
    }
  }

  throw Error('Authentication error')
}
