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
import { User } from '../models/users/user'
import { PostUsersRequest } from '../models/users/postUsersRequest'
import { PatchUsersRequest } from '../models/users/patchUsersRequest'
import { Role } from '../enums/role'
import Error403 from '../errors/error403'
import Error404 from '../errors/error404'
import Error409 from '../errors/error409'
import * as query from '../database/users'

@Tags('users')
@Route('users')
export class Users extends Controller {
  @Get()
  @Security('jwt', [Role.Admin, Role.User])
  public async getUsers(): Promise<User[]> {
    const result = await query.getUsers()

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
    const result = await query.getUserById(id)
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
    const result = await query.createUser(
      body.email,
      bcrypt.hashSync(body.password, 12),
      body.role
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
      const version = await query.getUserVersion(id)

      if (version != etag) {
        throw new Error409('etag dont match')
      }

      await query.updateUser(
        id,
        body.email,
        bcrypt.hashSync(body.password, 12),
        body.role
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
      await query.deleteUser(id)
    } else {
      throw new Error403('User dont have permission to update')
    }

    this.setStatus(200)
    return
  }
}
