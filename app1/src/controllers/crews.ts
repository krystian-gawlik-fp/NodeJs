import {
  Body,
  Controller,
  Delete,
  Get,
  Header,
  Patch,
  Path,
  Post,
  Route,
  Tags
} from 'tsoa'
import * as query from '../database/crew'
import { Crew } from '../models/crew/crew'
import { PostCrewRequest } from '../models/crew/postCrewRequest'
import Error404 from '../errors/error404'
import Error409 from '../errors/error409'
import uuid from 'short-unique-id'
import { PatchCrewRequest } from '../models/crew/patchCrewRequest'
import { CrewWithVersion } from '../models/crew/crewWithVersion'

@Tags('crew')
@Route('crew')
export class Crews extends Controller {
  @Get()
  public async getCrews(): Promise<Crew[]> {
    const result = await query.getCrews()

    return result.rows.map((r) => <Crew>{ ...r.data })
  }

  @Get(':id')
  public async getCrew(id: string): Promise<Crew> {
    const result = await query.getCrewById(id)
    const crew = result.rows[0]?.data

    if (!crew) {
      throw new Error404('Crew not found')
    }

    this.setHeader('etag', crew.transactionid)
    return <Crew>crew
  }

  @Post()
  public async postCrew(@Body() body: PostCrewRequest): Promise<string> {
    const id = new uuid({ length: 24 })()
    const crew = { ...body, id: id } as Crew
    const result = await query.createCrew(crew)

    return result.rows[0]
  }

  @Patch(':id')
  public async patchCrew(
    @Path() id: string,
    @Body() body: PatchCrewRequest,
    @Header('If-Match') etag: string
  ): Promise<void> {
    const version = await await query.getCrewVersion(id)

    if (version != etag) {
      throw new Error409('etag dont match')
    }

    await query.updateCrew(id, { ...body, id: id })

    this.setStatus(200)
    return
  }

  @Delete(':id')
  public async deleteUsers(@Path() id: string): Promise<void> {
    await query.deleteCrew(id)

    this.setStatus(200)
    return
  }

  @Get('/sync/:version')
  public async syncCrew(@Path() version: number): Promise<CrewWithVersion[]> {
    const result = await query.getCrewByVersion(version)
    return result.rows.map(
      (r) =>
        <CrewWithVersion>{
          ...r.data,
          deleteDate: r.deletedate,
          version: r.version
        }
    )
  }
}
