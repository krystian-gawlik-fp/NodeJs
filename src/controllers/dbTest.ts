import { Controller, Get, Path, Post, Route, Tags } from 'tsoa'
import db from '../util/database'
import { QueryResult } from 'pg'

@Tags('db')
@Route('db')
export class dbTest extends Controller {
  @Get()
  public async getTest(): Promise<any> {
    return (await db.query('SELECT * FROM test')).rows
  }

  @Post('{value}')
  public async postTest(@Path() value: number): Promise<QueryResult> {
    return db.query('INSERT INTO test (value) VALUES ($1)', [value])
  }
}
