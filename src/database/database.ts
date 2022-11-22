import axios from 'axios'
import { Pool } from 'pg'
import config from '../util/config'
import logger from '../util/logger'
import format from 'pg-format'

const pgConnectionString = config('PG_CONN_STRING')
const pgDbName = config('PG_DB_NAME')

export const db = (dbName?: string): Pool => {
  const connString = dbName
    ? `${pgConnectionString}/${dbName}`
    : `${pgConnectionString}/${pgDbName}`

  return new Pool({
    connectionString: connString
  })
}

export const seed = async () => {
  const dbExist =
    (
      await db('postgres').query(
        `SELECT * FROM pg_database WHERE datname = '${pgDbName}'`
      )
    ).rowCount > 0

  if (!dbExist) {
    await db('postgres').query(`CREATE DATABASE ${pgDbName}`)

    await db().query(`CREATE TABLE IF NOT EXISTS roles(
      id INT PRIMARY KEY NOT NULL,
      name VARCHAR(50) NOT NULL)`)

    await db().query(`CREATE TABLE IF NOT EXISTS users(
      id SERIAL PRIMARY KEY,
      email VARCHAR(50) NOT NULL,
      password VARCHAR(100) NOT NULL,
      roleId INT NOT NULL,
      deleteDate DATE,
      CONSTRAINT fkRoleId FOREIGN KEY (roleId) REFERENCES roles(id))`)

    await db().query(`CREATE TABLE IF NOT EXISTS crew(
        id CHAR(24) PRIMARY KEY NOT NULL,
        data JSONB NOT NULL,
        deleteDate DATE)`)

    await db().query(`INSERT INTO roles(id, name) VALUES
      (1,'admin'),
      (2,'user')`)

    await db()
      .query(`INSERT INTO users(email, password, roleId, deleteDate) VALUES
      ('admin@fp.com','$2a$12$KPUwUSUs1pnrdYZWzixPBu73UYfXXeNJjVQNVY5uZTT50Qm52rZ/O',1,null),
      ('user@fp.com','$2a$12$KPUwUSUs1pnrdYZWzixPBu73UYfXXeNJjVQNVY5uZTT50Qm52rZ/O',2,null),
      ('deleteduser@fp.com','$2a$12$KPUwUSUs1pnrdYZWzixPBu73UYfXXeNJjVQNVY5uZTT50Qm52rZ/O',2, '01-01-2022')`)

    const response = await axios.get(config('SPACEX_API_URL') + '/crew')

    const sqlValues: string[][] = response.data.map((c: any) => {
      return [c.id, c, null]
    })

    await db().query(
      format(`INSERT INTO crew(id, data, deleteDate) VALUES %L`, sqlValues)
    )

    logger.info('Seed done')
  }
}
