import app from './app'
import logger from './util/logger'
import * as dotenv from 'dotenv'
import config from './util/config'

dotenv.config()

const port = config('APP_PORT')
app.listen(port, () => {
  logger.info(`App1 is running on port ${port}...`)
})
