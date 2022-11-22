import { Body, Controller, Post, Route, Tags } from 'tsoa'
import { db } from '../database/database'
import { PostAuthRequest } from '../models/postAuthRequest'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import Error401 from '../errors/error401'
import { getUserByEmail } from '../database/users'

@Tags('Auth')
@Route('auth')
export class Auth extends Controller {
  @Post()
  public async postAuth(@Body() body: PostAuthRequest): Promise<string> {
    const user = await getUserByEmail(body.email)

    if (user && bcrypt.compareSync(body.password, user.password)) {
      if (!process.env.JWT_SECRET) {
        throw Error('JWT configuration missing')
      }

      return jwt.sign(
        {
          id: user.id,
          email: user.email,
          role: user.role.toString()
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
      )
    }

    throw new Error401('Login failed')
  }
}
