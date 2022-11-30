import { Crew } from '../models/crew'
import elasticClient from './client'

const indexName = 'crew'

export const bulkUpsert = async (items: Crew[]) => {
  await elasticClient.helpers.bulk({
    datasource: items,
    refresh: true,
    onDocument(doc: Crew) {
      if (doc.deleteDate) {
        return { delete: { _index: indexName, _id: doc.id } }
      }
      return [
        { update: { _index: indexName, _id: doc.id } },
        { doc_as_upsert: true }
      ]
    }
  })
}
