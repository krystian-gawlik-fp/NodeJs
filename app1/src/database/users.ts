import { Role } from '../enums/role'
import { db } from './database'

export const getUserByEmail = async (email: string) => {
  return (
    await db().query(
      `SELECT id, email, password, roleId AS role 
          FROM users u
          WHERE email = $1
            AND u.deletedate IS null`,
      [email]
    )
  ).rows[0]
}

export const getUsers = async () => {
  return await db()
    .query(`SELECT u.id, u.email, r.name AS role, u.xmin AS transactionId
    FROM users u
    JOIN roles r on u.roleId = r.id 
    WHERE u.deleteDate IS null`)
}

export const getUserById = async (id: number) => {
  return await db().query(
    `SELECT u.id, u.email, r.name AS role, u.xmin AS transactionId
        FROM users u
        JOIN roles r on u.roleId = r.id 
        WHERE u.deleteDate IS null
        AND u.id = $1`,
    [id]
  )
}

export const createUser = async (
  email: string,
  passwordHash: string,
  role: Role
) => {
  return await db().query(
    `INSERT INTO users(email, password, roleId, deleteDate) VALUES ($1,$2,$3,null) RETURNING id`,
    [email, passwordHash, role]
  )
}

export const updateUser = async (
  id: number,
  email: string,
  passwordHash: string,
  role: Role
) => {
  return await db().query(
    `UPDATE users SET email = $1, password = $2, roleId = $3 WHERE id = $4`,
    [email, passwordHash, role, id]
  )
}

export const deleteUser = async (id: number) => {
  return await db().query(`UPDATE users SET deleteDate = $1 WHERE id = $2`, [
    new Date(),
    id
  ])
}

export const getUserVersion = async (id: number) => {
  return await (
    await db().query('SELECT xmin FROM users WHERE id = $1', [id])
  ).rows[0].xmin
}
