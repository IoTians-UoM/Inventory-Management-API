import {Client, QueryResult, QueryResultRow} from 'pg';
import {config} from 'dotenv';

config();
let client: Client;

export const initDB = async (): Promise<(text: string, params: string[]) => Promise<QueryResult<QueryResultRow>>> => {
    if (client) {
        console.log('Returning existing client');
        return client.query;
    }

    client = new Client({
        connectionString: 'postgresql://postgres.eflajxvlrudtmbgbnorl:IoTians@123@aws-0-us-east-1.pooler.supabase.com:6543/postgres',
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
    
    const createProductTable = `
    CREATE TABLE IF NOT EXISTS product (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      price NUMERIC(10,2) NOT NULL,
      quantity INTEGER NOT NULL,
      timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    `;
    
    const createInventoryTable = `
    CREATE TABLE IF NOT EXISTS inventory (
      id SERIAL PRIMARY KEY,
      product_id INTEGER NOT NULL,
      product_name VARCHAR(255) NOT NULL,
      quantity INTEGER NOT NULL,
      timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (product_id) REFERENCES product(id)
    );
    `;
    
    // Create the product table
    query(createProductTable, [])
      .then(() => console.log('Product table created or already exists'))
      .catch((err) => console.error('Error creating product table', err));
    
    // Create the inventory table
    query(createInventoryTable, [])
      .then(() => console.log('Inventory table created or already exists'))
      .catch((err) => console.error('Error creating inventory table', err));

    return query;
}


const getAllProducts = async (): Promise<QueryResult<QueryResultRow>> => {
    const query = 'SELECT * FROM product';
    return client.query(query, []);
}

const getProductById = async (id: string): Promise<QueryResult<QueryResultRow>> => {
    const query = 'SELECT * FROM product WHERE id = $1';
    return client.query(query, [id]);
}

const addProduct = async (name: string, price: number, quantity: number): Promise<QueryResult<QueryResultRow>> => {
    const query = 'INSERT INTO product (name, price, quantity) VALUES ($1, $2, $3) RETURNING *';
    return client.query(query, [name, price, quantity]);
}

const updateProduct = async (id: string, name: string, price: number, quantity: number): Promise<QueryResult<QueryResultRow>> => {
    const query = 'UPDATE product SET name = $2, price = $3, quantity = $4 WHERE id = $1 RETURNING *';
    return client.query(query, [id, name, price, quantity]);
}

const deleteProduct = async (id: string): Promise<QueryResult<QueryResultRow>> => {
    const query = 'DELETE FROM product WHERE id = $1';
    return client.query(query, [id]);
}