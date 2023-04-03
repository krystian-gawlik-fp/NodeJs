import express from 'express'
import bodyParser from 'body-parser'
import { RegisterRoutes } from './routes/routes'
import swaggerUi from 'swagger-ui-express'
import swaggerDocument from './swagger.json'
import { seed } from './database/database'
import errorHandller from './middlewares/errorHandller'
import dotenv from 'dotenv'

dotenv.config()
const app = express()

app.use(bodyParser.json())
RegisterRoutes(app)
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))

app.use(errorHandller)

seed()

export default app
