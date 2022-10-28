import * as express from 'express'
import * as jwt from 'jsonwebtoken'
import { JwtAuthPayload } from '../models/jwtAuthPayload'

export function expressAuthentication(
  request: express.Request,
  securityName: string,
  scopes?: string[]
): Promise<JwtAuthPayload> {
  const token =
    request.body.token ||
    request.query.token ||
    request.headers['authorization']

  return new Promise((resolve, reject) => {
    if (!token) {
      reject(new Error('No token provided'))
    }

    if (!process.env.JWT_SECRET) {
      throw new Error('JWT configuration missing')
    }

    let decodedToken
    try {
      decodedToken = jwt.verify(token, process.env.JWT_SECRET) as JwtAuthPayload
    } catch {
      reject(new Error('Token not verified'))
    }
    console.log(scopes, decodedToken)
    if (decodedToken) {
      if (scopes?.includes(decodedToken.role.toString())) {
        resolve(decodedToken)
      } else {
        reject(new Error("User don't have required role"))
      }
    }
  })
}
