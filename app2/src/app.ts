import { sync } from './sync'
import logger from './util/logger'

//sync()
setInterval(sync, 3000)
logger.info('App2 is running...')
