import { Pool } from 'pg'

export const db = (dbName?: string): Pool => {
  const connString = dbName
    ? `${process.env.PG_CONN_STRING}/${dbName}`
    : `${process.env.PG_CONN_STRING}/${process.env.PG_DB_NAME}`

  return new Pool({
    connectionString: connString
  })
}

export const seed = async () => {
  const dbExist =
    (
      await db('postgres').query(
        `SELECT * FROM pg_database WHERE datname = '${process.env.PG_DB_NAME}'`
      )
    ).rowCount > 0

  if (!dbExist) {
    await db('postgres').query(`CREATE DATABASE ${process.env.PG_DB_NAME}`)

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

    await db().query(`INSERT INTO roles(id, name) VALUES
      (1,'admin'),
      (2,'user')`)

    await db()
      .query(`INSERT INTO users(email, password, roleId, deleteDate) VALUES
      ('admin@fp.com','$2a$12$KPUwUSUs1pnrdYZWzixPBu73UYfXXeNJjVQNVY5uZTT50Qm52rZ/O',1,null),
      ('user@fp.com','$2a$12$KPUwUSUs1pnrdYZWzixPBu73UYfXXeNJjVQNVY5uZTT50Qm52rZ/O',2,null),
      ('deleteduser@fp.com','$2a$12$KPUwUSUs1pnrdYZWzixPBu73UYfXXeNJjVQNVY5uZTT50Qm52rZ/O',2, '01-01-2022')`)
  }
}
