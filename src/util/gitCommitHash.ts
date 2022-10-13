import fs from 'fs/promises'

export default async (): Promise<string | null> => {
  try {
    const head = (await fs.readFile('.git/HEAD')).toString().trim()

    return (await fs.readFile('.git/' + head.substring(5))).toString().trim()
  } catch {
    return null
  }
}
