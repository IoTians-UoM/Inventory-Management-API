import express, {Request, Response} from 'express';
import morgan from 'morgan';
import {config} from "dotenv";

config();
const PORT = process.env.PORT || 9000;
const app = express();

app.use(morgan('combined'));

app.get('/', (req:Request, res:Response) => {
    res.send('Hello World!');
});

app.listen(PORT, () => {
    console.log('Server started on port ' + PORT);
});