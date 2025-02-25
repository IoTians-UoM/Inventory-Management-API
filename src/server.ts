// import express, {Request, Response} from 'express';
// import morgan from 'morgan';
// import {config} from "dotenv";
// import {db} from "./utils/db-connector";

// config();
// const PORT = process.env.PORT || 9000;
// const app = express();

// app.use(morgan('dev'));
// app.use(express.json());

// app.get('/', async (req: Request, res: Response) => {
//     const result = await db.query("SELECT * FROM product", []);
//     res.send({
//         data: result.rows
//     });
// });

// app.listen(PORT, () => {
//     console.log('Server started on port ' + PORT);
// });

import WebSocket, { WebSocketServer } from 'ws';

// Interface for inventory items
interface InventoryItem {
  item_name: string;
  quantity: number;
  last_updated: string;
}

// Interface for incoming messages
interface MessageData {
  tag_id: string;
  item_name?: string;
  quantity?: number;
  timestamp?: string;
}

// In-memory inventory storage
const inventory: Record<string, InventoryItem> = {};

// Create WebSocket server
const wss = new WebSocketServer({ port: 8000 }, () => {
  console.log('WebSocket server started on ws://localhost:8000');
});

// Handle connection
wss.on('connection', (ws: WebSocket) => {
  console.log('Client connected.');

  ws.on('message', (message: string) => {
    console.log(`Received: ${message}`);
    try {
      const { type, data } = JSON.parse(message) as { type: string; data: MessageData };
      handleMessage(ws, type, data);
    } catch (error) {
      console.error('Invalid message format:', error);
      sendError(ws, 'Invalid JSON format');
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected.');
  });
});

// Handle incoming messages based on type
function handleMessage(ws: WebSocket, type: string, data: MessageData): void {
  switch (type) {
    case 'write_rfid':
      writeRFID(ws, data);
      break;
    case 'stock_in':
      stockIn(ws, data);
      break;
    case 'stock_out':
      stockOut(ws, data);
      break;
    case 'inventory_status_request':
      getInventoryStatus(ws, data);
      break;
    default:
      sendError(ws, `Unsupported message type: ${type}`);
  }
}

// Write RFID tag details
function writeRFID(ws: WebSocket, { tag_id, item_name = '', quantity = 0, timestamp = '' }: MessageData): void {
  inventory[tag_id] = { item_name, quantity, last_updated: timestamp };
  ws.send(JSON.stringify({ status: 'success', message: 'RFID tag written.', inventory: inventory[tag_id] }));
}

// Handle stock in
function stockIn(ws: WebSocket, { tag_id, quantity = 0, timestamp = '' }: MessageData): void {
  const item = inventory[tag_id];
  if (item) {
    item.quantity += quantity;
    item.last_updated = timestamp;
    ws.send(JSON.stringify({ status: 'success', message: 'Stock added.', inventory: item }));
  } else {
    sendError(ws, `Tag ID ${tag_id} not found.`);
  }
}

// Handle stock out
function stockOut(ws: WebSocket, { tag_id, quantity = 0, timestamp = '' }: MessageData): void {
  const item = inventory[tag_id];
  if (item) {
    if (item.quantity >= quantity) {
      item.quantity -= quantity;
      item.last_updated = timestamp;
      ws.send(JSON.stringify({ status: 'success', message: 'Stock removed.', inventory: item }));
    } else {
      sendError(ws, 'Insufficient stock for removal.');
    }
  } else {
    sendError(ws, `Tag ID ${tag_id} not found.`);
  }
}

// Get inventory status
function getInventoryStatus(ws: WebSocket, { tag_id }: MessageData): void {
  const item = inventory[tag_id];
  if (item) {
    ws.send(JSON.stringify({ status: 'success', inventory: item }));
  } else {
    sendError(ws, `Tag ID ${tag_id} not found.`);
  }
}

// Send error response
function sendError(ws: WebSocket, errorMessage: string): void {
  ws.send(JSON.stringify({ status: 'error', message: errorMessage }));
}
