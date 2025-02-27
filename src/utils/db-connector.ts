import {Client, QueryResult, QueryResultRow} from 'pg';
import {config} from 'dotenv';
import { InventoryItem, Product } from '../types/types';

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


const getAllProducts = async (): Promise<Product[]> => {
    const query = 'SELECT * FROM product';
    const result = await client.query(query);
    return result.rows;
}

const getProductById = async (id: string): Promise<Product[]> => {
    const query = 'SELECT * FROM product WHERE id = $1';
    const result = await client.query(query, [id]);
    return result.rows;
}

const addProduct = async (name: string, price: number, quantity: number): Promise<Product[]> => {
    const query = 'INSERT INTO product (name, price, quantity) VALUES ($1, $2, $3) RETURNING *';
    const result = await client.query(query, [name, price, quantity]);
    return result.rows;
}

const updateProduct = async (id: string, name: string, price: number, quantity: number): Promise<Product[]> => {
    const query = 'UPDATE product SET name = $2, price = $3, quantity = $4 WHERE id = $1 RETURNING *';
    const result = await client.query(query, [id,name,price,quantity]);
    return result.rows;
}

const deleteProduct = async (id: string): Promise<Product[]> => {
    const query = 'DELETE FROM product WHERE id = $1 RETURNING *';
    const result = await client.query(query, [id]);
    return result.rows;
}

const getInventory = async (): Promise<InventoryItem[]> => {
    const query = 'SELECT * FROM inventory';
    const result = await client.query(query);
    return result.rows;
}

const addInventoryItem = async (product_id: string, product_name: string, quantity: number): Promise<InventoryItem[]> => {
    const query = 'INSERT INTO inventory (product_id, product_name, quantity) VALUES ($1, $2, $3) RETURNING *';
    const result = await client.query(query, [product_id, product_name, quantity]);
    return result.rows;
}

const updateInventoryItem = async (id: string, product_id: string, product_name: string, quantity: number): Promise<InventoryItem[]> => {
    const query = 'UPDATE inventory SET product_id = $2, product_name = $3, quantity = $4 WHERE id = $1 RETURNING *';
    const result = await client.query(query, [id, product_id, product_name, quantity]);
    return result.rows;
}

const deleteInventoryItem = async (id: string): Promise<InventoryItem[]> => {
    const query = 'DELETE FROM inventory WHERE id = $1 RETURNING *';
    const result = await client.query(query, [id]);
    return result.rows;
}

const getInventoryById = async (id: string): Promise<InventoryItem[]> => {
    const query = 'SELECT * FROM inventory WHERE id = $1';
    const result = await client.query(query, [id]);
    return result.rows;
}

const inventoryDecrement = async (product_id:string, quantity: number, product_name:string): Promise<InventoryItem[]> => {
    const checkStockQuery = `SELECT quantity,price FROM product WHERE id = $1;`;

    const p = (await client.query(checkStockQuery, [product_id])).rows[0]
    if(quantity<p.quantity){
        const result1 = await updateProduct(product_id, product_name, p.price, p.quantity - quantity)
        const result2 = await addInventoryItem(product_id, product_name, quantity)
        return result2
    }

    return [];
}

const inventoryIncrement = async (product_id:string, quantity: number, product_name:string): Promise<InventoryItem[]> => {
    const checkStockQuery = `SELECT quantity FROM product WHERE id = $1;`;

    const p = (await client.query(checkStockQuery, [product_id])).rows[0]
    if(quantity<p.quantity){
        const result1 = await updateProduct(product_id, product_name, p.price, p.quantity + quantity)
        const result2 = await addInventoryItem(product_id, product_name, quantity)
        return result2
    }

    return [];
}

const syncDB = async (products: Product[], inventory: InventoryItem[]): Promise<{products:Product[],inventory:InventoryItem[]}> => {
    for (const product of products) {
        const existingProduct = await getProductById(product.id.toString());
        if (existingProduct.length === 0) {
            await addProduct(product.name, product.price, product.quantity);
        } else {
            const existing = existingProduct[0];
            if (existing.name !== product.name || existing.price !== product.price || existing.quantity !== product.quantity) {
                await updateProduct(product.id.toString(), product.name, product.price, product.quantity);
            }
        }
    }

    for (const item of inventory) {
        const existingInventoryItem = await getInventoryById(item.product_id.toString());
        if (existingInventoryItem.length === 0) {
            await addInventoryItem(item.product_id.toString(), item.product_name!, item.quantity);
        } else {
            const existing = existingInventoryItem[0];
            if (existing.product_name !== item.product_name || existing.quantity !== item.quantity) {
                await updateInventoryItem(item.product_id.toString(), item.product_id.toString(), item.product_name!, item.quantity);
            }
        }
    }

    const p = await getAllProducts()
    const i = await getInventory()
    return {products:p, inventory:i}
}


export { getAllProducts, getProductById, addProduct, updateProduct, deleteProduct, getInventory, addInventoryItem, updateInventoryItem, deleteInventoryItem, getInventoryById, inventoryIncrement, inventoryDecrement, syncDB };