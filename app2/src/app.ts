import { sync } from './sync'
import config from './util/config'
import logger from './util/logger'

setInterval(sync, +config('SYNC_INTERVAL'))
logger.info('App2 is running...')
