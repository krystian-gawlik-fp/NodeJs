import { Controller, Get, Route, Tags } from 'tsoa'
import { GetVersionResponse } from '../models/getVersionResponse'
import { execSync } from 'child_process'

@Tags('version')
@Route('version')
export class Version extends Controller {
  @Get()
  public async getVersion(): Promise<GetVersionResponse> {
    const commitHash: string = execSync('git rev-parse HEAD').toString().trim()

    const version: string | undefined = process.env.npm_package_version

    return { commitHash, version }
  }
}
