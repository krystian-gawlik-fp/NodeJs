import fs from 'fs/promises'
import path from 'path'

const filePath = path.join(__dirname, '../files/version.txt')

export const getCurrentVersion = async () => {
  let version: number
  try {
    version = +(await fs.readFile(filePath)).toString()
  } catch {
    await fs.writeFile(filePath, '0')
    version = 0
  }

  return version
}

export const setCurrentVersion = async (version: number) => {
  const data = version.toString()

  version = +(await fs.writeFile(filePath, data))

  return version
}
