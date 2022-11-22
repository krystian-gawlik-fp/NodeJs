import { Controller, Get, Route, Security, Tags } from 'tsoa'
import { GetVersionResponse } from '../models/getVersionResponse'
import gitCommitHash from '../util/gitCommitHash'

@Tags('version')
@Route('version')
export class Version extends Controller {
  @Get()
  public async getVersion(): Promise<GetVersionResponse> {
    const commitHash: string = (await gitCommitHash()) ?? 'unknown'

    const version: string | undefined = process.env.npm_package_version

    return { commitHash, version }
  }
}
