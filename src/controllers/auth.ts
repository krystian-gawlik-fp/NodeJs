import { Body, Controller, Post, Route, Tags } from 'tsoa'
import { db } from '../util/database'
import { PostAuthRequest } from '../models/postAuthRequest'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

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
        { expiresIn: '1h' }
      )
    }

    throw Error('Login failed')
  }
}
