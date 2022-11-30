import { Body, Controller, Post, Route, Tags } from 'tsoa'
import { db } from '../database/database'
import { PostAuthRequest } from '../models/postAuthRequest'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import Error401 from '../errors/error401'
import config from '../util/config'
import { getUserByEmail } from '../database/users'

@Tags('Auth')
@Route('auth')
export class Auth extends Controller {
  @Post()
  public async postAuth(@Body() body: PostAuthRequest): Promise<string> {
    const user = await getUserByEmail(body.email)

    if (user && bcrypt.compareSync(body.password, user.password)) {
      return jwt.sign(
        {
          id: user.id,
          email: user.email,
          role: user.role.toString()
        },
        config('JWT_SECRET'),
        { expiresIn: config('JWT_EXPIRES_IN') }
      )
    }

    throw new Error401('Login failed')
  }
}
