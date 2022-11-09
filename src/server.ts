import app from './app'
import logger from './util/logger'
import * as dotenv from 'dotenv'

dotenv.config()

app.listen(process.env.APP_PORT, () => {
  logger.info(`Server is running on port ${process.env.APP_PORT}...`)
})
