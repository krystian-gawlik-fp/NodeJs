import { Crew } from '../models/crew/crew'
import { db } from './database'

export const getCrews = async () => {
  return await db().query(`SELECT data
        FROM crew
        WHERE deleteDate IS null`)
}

export const getCrewById = async (id: string) => {
  return await db().query(
    `SELECT data, xmin AS transactionId
        FROM crew
        WHERE deleteDate IS null
        AND id = $1`,
    [id]
  )
}

export const createCrew = async (data: Crew) => {
  return await db().query(
    `INSERT INTO crew(id, data) VALUES ($1,$2) RETURNING id`,
    [data.id, data]
  )
}

export const updateCrew = async (id: string, data: Crew) => {
  return await db().query(`UPDATE crew SET data = $1 WHERE id = $2`, [data, id])
}

export const deleteCrew = async (id: string) => {
  return await db().query(`UPDATE crew SET deleteDate = $1 WHERE id = $2`, [
    new Date(),
    id
  ])
}

export const getCrewVersion = async (id: string) => {
  return await (
    await db().query('SELECT xmin FROM crew WHERE id = $1', [id])
  ).rows[0].xmin
}

export const getCrewByVersion = async (version: number) => {
  return await db().query(
    `SELECT data
    FROM crew
    WHERE xmin::text::bigint > $1`,
    [version]
  )
}
