import {Client, QueryResult, QueryResultRow} from 'pg';
import {config} from 'dotenv';

config();

const client = new Client({
    connectionString: process.env.DB_URL,
});

client.connect()
    .then(() => {
        console.log('Connected to PostgreSQL');
    })
    .catch((err) => {
        console.log('Error connecting to PostgreSQL', err);
    });

const query = async (text: string, params: string[]): Promise<QueryResult<QueryResultRow>> => {
    console.log('executing: ', text);
    const result = await client.query(text, params);
    console.log('row count: ', result.rowCount);
    return result;
}

export const db = {
    query
};
