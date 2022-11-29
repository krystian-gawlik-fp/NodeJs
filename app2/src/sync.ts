import axios, { AxiosResponse } from 'axios'
import logger from './util/logger'
import config from './util/config'
import elasticClient from './util/elasticClient'
import { AggregationsMaxAggregate } from '@elastic/elasticsearch/lib/api/types'
import { Crew } from './models/crew'
import { getCurrentVersion, setCurrentVersion } from './util/versionStore'

export const sync = async () => {
  const version = await getCurrentVersion()

  let itemsToSync: Crew[] = []
  try {
    itemsToSync = (
      await axios.get(`${config('APP1_URL')}/crew/sync/${version}`)
    ).data as Crew[]
  } catch {
    logger.error('sync failed')
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

  await elasticClient.helpers.bulk({
    datasource: itemsToSync,
    refresh: true,
    onDocument(doc) {
      if (doc.deleteDate) {
        return { delete: { _index: 'test', _id: doc.id } }
      }
      return [
        { update: { _index: 'test', _id: doc.id } },
        { doc_as_upsert: true }
      ]
    }
  })

  setCurrentVersion(newVersion)
}
