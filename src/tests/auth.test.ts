import { describe, test, expect } from '@jest/globals'
import request from 'supertest'
import app from '../app'
import { PostAuthRequest } from '../models/postAuthRequest'
import dotenv from 'dotenv'
import jwt from 'jsonwebtoken'
import { JwtAuthPayload } from '../models/jwtAuthPayload'
import { Role } from '../enums/role'

dotenv.config()

describe('Testing auth endpoint', () => {
  test('Correct login and password', async () => {
    const resp = await request(app)
      .post('/auth')
      .send(<PostAuthRequest>{
        email: 'admin@fp.com',
        password: 'password'
      })

    expect(resp.statusCode).toEqual(200)

    const payload = jwt.verify(
      resp.body,
      process.env.JWT_SECRET ?? ''
    ) as JwtAuthPayload

    expect(payload.email).toEqual('admin@fp.com')
    expect(payload.role).toEqual(Role.Admin)
  })

  test('Wrong login', async () => {
    const resp = await request(app)
      .post('/auth')
      .send(<PostAuthRequest>{
        email: 'wrong@fp.com',
        password: 'password'
      })

    expect(resp.statusCode).toEqual(401)
  })

  test('Wrong password', async () => {
    const resp = await request(app)
      .post('/auth')
      .send(<PostAuthRequest>{
        email: 'admin@fp.com',
        password: 'wrong'
      })

    expect(resp.statusCode).toEqual(401)
  })
})
