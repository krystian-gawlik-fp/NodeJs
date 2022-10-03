import { Controller, Get, Route } from "tsoa";
import { GetVersionResponse } from "../models/getVersionResponse";

@Route("version")
export class Version extends Controller {
  @Get()
  public async getVersion(): Promise<GetVersionResponse> {
    const commitHash: string = require("child_process")
      .execSync("git rev-parse HEAD")
      .toString()
      .trim();

    const version: string = require("../../package.json").version;

    return { commitHash, version };
  }
}
