import { Body, Controller, Post, Route, Tags } from 'tsoa'
import { db } from '../util/database'
import { PostAuthRequest } from '../models/postAuthRequest'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import Error401 from '../errors/error401'
import config from '../util/config'

@Tags('Auth')
@Route('auth')
export class Auth extends Controller {
  @Post()
  public async postAuth(@Body() body: PostAuthRequest): Promise<string> {
    const user = (
      await db().query(
        `SELECT id, email, password, roleId AS role 
        FROM users u
        WHERE email = $1
          AND u.deletedate IS null`,
        [body.email]
      )
    ).rows[0]

    if (user && bcrypt.compareSync(body.password, user.password)) {
      return jwt.sign(
        {
          id: user.id,
          email: user.email,
          role: user.role.toString()
        },
        config('JWT_SECRET'),
        { expiresIn: '1h' }
      )
    }

    throw new Error401('Login failed')
  }
}
