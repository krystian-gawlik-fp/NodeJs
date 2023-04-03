import axios from 'axios'
import logger from './util/logger'
import config from './util/config'
import { Crew } from './models/crew'
import { getCurrentVersion, setCurrentVersion } from './util/versionStore'
import { bulkUpsert } from './elastic/crewRepository'

export const sync = async () => {
  const version = await getCurrentVersion()

  let itemsToSync: Crew[] = []
  try {
    itemsToSync = (
      await axios.get(`${config('APP1_URL')}/crew/sync/${version}`)
    ).data as Crew[]
  } catch {
    logger.error('Sync failed - Cant connect to API')
    return
  }

  const newVersion = Math.max(...itemsToSync.map((i) => i.version))

  if (itemsToSync.length) {
    logger.info(
      `Synchronizing ${itemsToSync.length} items from version ${version} to ${newVersion}`
    )
  } else {
    logger.info(`Up to date on version ${version}`)
    return
  }

  try {
    await bulkUpsert(itemsToSync)
  } catch {
    logger.error('Sync failed - Cant connect to Elastic')
    return
  }

  setCurrentVersion(newVersion)
}
