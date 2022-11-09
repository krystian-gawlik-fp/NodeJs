import { describe, test, expect } from '@jest/globals'
import request from 'supertest'
import app from '../app'
import { PostAuthRequest } from '../models/postAuthRequest'
import dotenv from 'dotenv'
import { User } from '../models/users/user'
import { PostUsersRequest } from '../models/users/postUsersRequest'
import { Role } from '../enums/role'

dotenv.config()

let adminToken: string

beforeAll(async () => {
  const resp = await request(app)
    .post('/auth')
    .send(<PostAuthRequest>{
      email: 'admin@fp.com',
      password: 'password'
    })

  expect(resp.statusCode).toEqual(200)

  adminToken = resp.body
})

describe('Testing GET users', () => {
  test('Without auth token', async () => {
    const resp = await request(app).get('/users')

    expect(resp.statusCode).toEqual(401)
  })

  test('With invalid token', async () => {
    const resp = await request(app)
      .get('/users')
      .set(
        'authorization',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'
      )

    expect(resp.statusCode).toEqual(401)
  })

  test('With valid token', async () => {
    const resp = await request(app)
      .get('/users')
      .set('authorization', adminToken)

    expect(resp.statusCode).toEqual(200)
    const result = resp.body as User[]
    const expected = [
      { id: 1, email: 'admin@fp.com', role: 'admin' },
      { id: 2, email: 'user@fp.com', role: 'user' }
    ]
    expect(result).toContainEqual(expected[0])
    expect(result).toContainEqual(expected[1])
  })
})

describe('Testing GET user', () => {
  test('Without auth token', async () => {
    const resp = await request(app).get('/users/1')

    expect(resp.statusCode).toEqual(401)
  })

  test('With invalid token', async () => {
    const resp = await request(app)
      .get('/users/1')
      .set(
        'authorization',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'
      )

    expect(resp.statusCode).toEqual(401)
  })

  test('With valid token', async () => {
    const resp = await request(app)
      .get('/users/1')
      .set('authorization', adminToken)

    expect(resp.statusCode).toEqual(200)
    const result = resp.body as User[]
    const expected = { id: 1, email: 'admin@fp.com', role: 'admin' }

    expect(result).toEqual(expected)
  })

  test('With non existing user', async () => {
    const resp = await request(app)
      .get('/users/0')
      .set('authorization', adminToken)

    expect(resp.statusCode).toEqual(404)
  })
})

describe('Testing POST user', () => {
  test('Without auth token', async () => {
    const resp = await request(app)
      .post('/users')
      .send(<PostUsersRequest>{
        email: 'newEmail',
        password: 'newPassword',
        role: Role.Admin
      })

    expect(resp.statusCode).toEqual(401)
  })

  test('With invalid token', async () => {
    const resp = await request(app)
      .post('/users')
      .set(
        'authorization',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'
      )
      .send(<PostUsersRequest>{
        email: 'newEmail',
        password: 'newPassword',
        role: Role.Admin
      })

    expect(resp.statusCode).toEqual(401)
  })

  test('With valid token', async () => {
    const resp = await request(app)
      .post('/users')
      .set('authorization', adminToken)
      .send(<PostUsersRequest>{
        email: 'newEmail',
        password: 'newPassword',
        role: Role.Admin
      })

    expect(resp.statusCode).toEqual(200)
    const addedId = resp.body.id

    const resp2 = await request(app)
      .get(`/users/${addedId}`)
      .set('authorization', adminToken)

    expect(resp2.statusCode).toEqual(200)

    const result = resp2.body as User
    const expected = <User>{
      id: addedId,
      email: 'newEmail',
      role: 'admin'
    }

    expect(result).toEqual(expected)
  })
})

describe('Testing DELETE user', () => {
  test('Without auth token', async () => {
    const resp = await request(app).delete('/users/2')

    expect(resp.statusCode).toEqual(401)
  })

  test('With invalid token', async () => {
    const resp = await request(app)
      .delete('/users/2')
      .set(
        'authorization',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'
      )

    expect(resp.statusCode).toEqual(401)
  })

  test('With valid token', async () => {
    const resp = await request(app)
      .post('/users')
      .set('authorization', adminToken)
      .send(<PostUsersRequest>{
        email: 'newEmail',
        password: 'newPassword',
        role: Role.Admin
      })

    expect(resp.statusCode).toEqual(200)
    const addedId = resp.body.id

    const resp2 = await request(app)
      .delete(`/users/${addedId}`)
      .set('authorization', adminToken)

    expect(resp2.statusCode).toEqual(200)

    const resp3 = await request(app)
      .get(`/users/${addedId}`)
      .set('authorization', adminToken)

    expect(resp3.statusCode).toEqual(404)
  })
})

describe('Testing PATCH user', () => {
  test('Without auth token', async () => {
    const resp = await request(app)
      .patch('/users/2')
      .send(<PostUsersRequest>{
        email: 'newEmail',
        password: 'newPassword',
        role: Role.Admin
      })

    expect(resp.statusCode).toEqual(401)
  })

  test('With invalid token', async () => {
    const resp = await request(app)
      .patch('/users/2')
      .set(
        'authorization',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'
      )
      .send(<PostUsersRequest>{
        email: 'newEmail',
        password: 'newPassword',
        role: Role.Admin
      })

    expect(resp.statusCode).toEqual(401)
  })

  test('With valid token', async () => {
    const resp = await request(app)
      .post('/users')
      .set('authorization', adminToken)
      .send(<PostUsersRequest>{
        email: 'newEmail',
        password: 'newPassword',
        role: Role.Admin
      })

    expect(resp.statusCode).toEqual(200)
    const addedId = resp.body.id

    const resp2 = await request(app)
      .get(`/users/${addedId}`)
      .set('authorization', adminToken)

    expect(resp2.statusCode).toEqual(200)

    const etag = resp2.header['etag']

    const resp3 = await request(app)
      .patch(`/users/${addedId}`)
      .set('authorization', adminToken)
      .set('if-match', etag)
      .send(<PostUsersRequest>{
        email: 'editedEmail',
        password: 'newPassword',
        role: Role.User
      })

    expect(resp3.statusCode).toEqual(200)

    const resp4 = await request(app)
      .get(`/users/${addedId}`)
      .set('authorization', adminToken)

    expect(resp4.statusCode).toEqual(200)

    const user = resp4.body as User
    expect(user.email).toEqual('editedEmail')
    expect(user.role).toEqual('user')
  })

  test('With invalid etag', async () => {
    const resp = await request(app)
      .post('/users')
      .set('authorization', adminToken)
      .send(<PostUsersRequest>{
        email: 'newEmail',
        password: 'newPassword',
        role: Role.Admin
      })

    expect(resp.statusCode).toEqual(200)
    const addedId = resp.body.id

    const etag = '0'

    const resp3 = await request(app)
      .patch(`/users/${addedId}`)
      .set('authorization', adminToken)
      .set('if-match', etag)
      .send(<PostUsersRequest>{
        email: 'editedEmail',
        password: 'newPassword',
        role: Role.User
      })

    expect(resp3.statusCode).toEqual(409)
  })
})
