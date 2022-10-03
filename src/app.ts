import express from 'express';
import bodyParser from 'body-parser';

const app = express();

app.use(bodyParser);

app.listen(3000, () =>{
    console.log('Server is running...'); 
});