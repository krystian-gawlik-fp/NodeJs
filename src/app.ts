import express from 'express';
import bodyParser from 'body-parser';
import { RegisterRoutes } from './routes/routes';
import swaggerUi from 'swagger-ui-express'

const app = express();

app.use(bodyParser.json());
RegisterRoutes(app);
app.use('/swagger', swaggerUi.serve, swaggerUi.setup(require('../swagger.json')));

app.listen(3000, () => {
    console.log('Server is running...');
});