import { Client } from '@elastic/elasticsearch'
import config from './config'

export default new Client({
  node: config('ELASTICSEARCH_NODE'),
  auth: {
    username: config('ELASTICSEARCH_USER'),
    password: config('ELASTICSEARCH_PASSWORD')
  }
})
