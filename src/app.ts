import express from 'express'
import bodyParser from 'body-parser'
import { RegisterRoutes } from './routes/routes'
import swaggerUi from 'swagger-ui-express'
import swaggerDocument from './swagger.json'
import db from './util/database'
import * as dotenv from 'dotenv'
import logger from './util/logger'

dotenv.config()
const app = express()

app.use(bodyParser.json())
RegisterRoutes(app)
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))

db.query('CREATE TABLE IF NOT EXISTS test (value int);')

app.listen(process.env.APP_PORT, () => {
  logger.info(`Server is running on port ${process.env.APP_PORT}...`)
})
