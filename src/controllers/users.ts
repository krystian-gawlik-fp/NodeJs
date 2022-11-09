import {
  Body,
  Controller,
  Delete,
  Get,
  Header,
  Patch,
  Path,
  Post,
  Request,
  Route,
  Security,
  Tags
} from 'tsoa'
import bcrypt from 'bcryptjs'
import { db } from '../util/database'
import { User } from '../models/users/user'
import { PostUsersRequest } from '../models/users/postUsersRequest'
import { PatchUsersRequest } from '../models/users/patchUsersRequest'
import { Role } from '../enums/role'
import Error403 from '../errors/error403'
import Error404 from '../errors/error404'
import Error409 from '../errors/error409'

@Tags('users')
@Route('users')
export class Users extends Controller {
  @Get()
  @Security('jwt', [Role.Admin, Role.User])
  public async getUsers(): Promise<User[]> {
    const result = await db()
      .query(`SELECT u.id, u.email, r.name AS role, u.xmin AS transactionId
      FROM users u
      JOIN roles r on u.roleId = r.id 
      WHERE u.deleteDate IS null`)

    return result.rows.map((r) => {
      return <User>{
        id: r.id,
        email: r.email,
        role: r.role
      }
    })
  }

  @Get(':id')
  @Security('jwt', [Role.Admin, Role.User])
  public async getUser(id: number): Promise<User> {
    const result = await db().query(
      `SELECT u.id, u.email, r.name AS role, u.xmin AS transactionId
      FROM users u
      JOIN roles r on u.roleId = r.id 
      WHERE u.deleteDate IS null
      AND u.id = $1`,
      [id]
    )
    const user = result.rows[0]
    if (!user) {
      throw new Error404('User not found')
    }

    this.setHeader('etag', user.transactionid)
    return <User>{
      id: user.id,
      email: user.email,
      role: user.role
    }
  }

  @Post()
  @Security('jwt', [Role.Admin])
  public async postUsers(@Body() body: PostUsersRequest): Promise<number> {
    const result = await db().query(
      `INSERT INTO users(email, password, roleId, deleteDate) VALUES ($1,$2,$3,null) RETURNING id`,
      [body.email, bcrypt.hashSync(body.password, 12), body.role]
    )

    return result.rows[0]
  }

  @Patch(':id')
  @Security('jwt', [Role.Admin, Role.User])
  public async patchUesers(
    @Request() request: any,
    @Path() id: number,
    @Body() body: PatchUsersRequest,
    @Header('If-Match') etag: string
  ): Promise<void> {
    if (request['user'].role === Role.Admin || request['user'].id === id) {
      const version = await (
        await db().query('SELECT xmin FROM users WHERE id = $1', [id])
      ).rows[0].xmin

      if (version != etag) {
        throw new Error409('etag dont match')
      }

      await db().query(
        `UPDATE users SET email = $1, password = $2, roleId = $3 WHERE id = $4`,
        [body.email, bcrypt.hashSync(body.password, 12), body.role, id]
      )
    } else {
      throw new Error403('User dont have permission to update')
    }

    this.setStatus(200)
    return
  }

  @Delete(':id')
  @Security('jwt', [Role.Admin, Role.User])
  public async deleteUsers(
    @Request() request: any,
    @Path() id: number
  ): Promise<void> {
    if (request['user'].role === Role.Admin || request['user'].id === id) {
      await db().query(`UPDATE users SET deleteDate = $1 WHERE id = $2`, [
        new Date(),
        id
      ])
    } else {
      throw new Error403('User dont have permission to update')
    }

    this.setStatus(200)
    return
  }
}
