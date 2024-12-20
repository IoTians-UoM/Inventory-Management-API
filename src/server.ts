import express, {Request, Response} from 'express';
import morgan from 'morgan';
import {config} from "dotenv";
import {db} from "./utils/db-connector";

config();
const PORT = process.env.PORT || 9000;
const app = express();

app.use(morgan('dev'));
app.use(express.json());

app.get('/', async (req: Request, res: Response) => {
    const result = await db.query("SELECT * FROM product", []);
    res.send({
        data: result.rows
    });
});

app.listen(PORT, () => {
    console.log('Server started on port ' + PORT);
});