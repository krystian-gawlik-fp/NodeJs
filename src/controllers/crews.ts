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
import { Crew } from '../models/crew'
import { PostUsersRequest } from '../models/users/postUsersRequest'
import { PatchUsersRequest } from '../models/users/patchUsersRequest'
import { Role } from '../enums/role'
import Error403 from '../errors/error403'
import Error404 from '../errors/error404'
import Error409 from '../errors/error409'
import axios from 'axios'
import config from '../util/config'

@Tags('Crews')
@Route('Crew')
export class Crews extends Controller {
  @Get()
  public async getCrews(): Promise<Crew[]> {
    const result = await db().query(`SELECT data
        FROM crew
        WHERE deleteDate IS null`)

    return result.rows
  }

  @Get(':id')
  public async getCrew(id: string): Promise<Crew> {
    const result = await db().query(
      `SELECT data, xmin AS transactionId
      FROM crew
      WHERE deleteDate IS null
      AND id = $1`,
      [id]
    )
    const crew = result.rows[0]
    if (!crew) {
      throw new Error404('Crew not found')
    }

    this.setHeader('etag', crew.transactionid)
    return <Crew>crew
  }

  // @Post()
  // @Security('jwt', [Role.Admin])
  // public async postUsers(@Body() body: PostUsersRequest): Promise<number> {
  //   const result = await db().query(
  //     `INSERT INTO users(email, password, roleId, deleteDate) VALUES ($1,$2,$3,null) RETURNING id`,
  //     [body.email, bcrypt.hashSync(body.password, 12), body.role]
  //   )

  //   return result.rows[0]
  // }

  // @Patch(':id')
  // @Security('jwt', [Role.Admin, Role.User])
  // public async patchUesers(
  //   @Request() request: any,
  //   @Path() id: number,
  //   @Body() body: PatchUsersRequest,
  //   @Header('If-Match') etag: string
  // ): Promise<void> {
  //   if (request['user'].role === Role.Admin || request['user'].id === id) {
  //     const version = await (
  //       await db().query('SELECT xmin FROM users WHERE id = $1', [id])
  //     ).rows[0].xmin

  //     if (version != etag) {
  //       throw new Error409('etag dont match')
  //     }

  //     await db().query(
  //       `UPDATE users SET email = $1, password = $2, roleId = $3 WHERE id = $4`,
  //       [body.email, bcrypt.hashSync(body.password, 12), body.role, id]
  //     )
  //   } else {
  //     throw new Error403('User dont have permission to update')
  //   }

  //   this.setStatus(200)
  //   return
  // }

  // @Delete(':id')
  // @Security('jwt', [Role.Admin, Role.User])
  // public async deleteUsers(
  //   @Request() request: any,
  //   @Path() id: number
  // ): Promise<void> {
  //   if (request['user'].role === Role.Admin || request['user'].id === id) {
  //     await db().query(`UPDATE users SET deleteDate = $1 WHERE id = $2`, [
  //       new Date(),
  //       id
  //     ])
  //   } else {
  //     throw new Error403('User dont have permission to update')
  //   }

  //   this.setStatus(200)
  //   return
  // }
}
