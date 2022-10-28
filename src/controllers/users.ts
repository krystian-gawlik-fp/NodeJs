import {
  Body,
  Controller,
  Delete,
  Get,
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

@Tags('users')
@Route('users')
@Security('jwt', ['admin'])
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
        role: r.role,
        version: r.transactionId
      }
    })
  }

  @Post()
  @Security('jwt', [Role.Admin])
  public async postUsers(@Body() body: PostUsersRequest): Promise<void> {
    await db().query(
      `INSERT INTO users(email, password, roleId, deleteDate) VALUES ($1,$2,$3,null)`,
      [body.email, bcrypt.hashSync(body.password, 12), body.role]
    )

    return
  }

  @Patch(':id')
  @Security('jwt', [Role.Admin, Role.User])
  public async patchUesers(
    @Request() request: any,
    @Path() id: number,
    @Body() body: PatchUsersRequest
  ): Promise<void> {
    if (request['user'].role === Role.Admin || request['user'].id === id) {
      await db().query(
        `UPDATE users SET email = $1, password = $2, roleId = $3 WHERE id = $4`,
        [body.email, bcrypt.hashSync(body.password, 12), body.role, id]
      )
    } else {
      throw Error('User dont have permission to update')
    }
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
      throw Error('User dont have permission to update')
    }

    return
  }
}
