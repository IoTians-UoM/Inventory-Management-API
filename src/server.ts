import { Message, Product, Status, Type } from './types/types';
import {config} from "dotenv";
import {initDB} from "./utils/db-connector";
import { initWSServer, sendWSMessage } from './utils/websocket-server';

config();
const PORT = parseInt(process.env.PORT || '') || 8000;
const db = initDB();
const ws = initWSServer(PORT, handleMessage);

function handleMessage(msg: Message): void {
  switch (msg.type) {
    case Type.PRODUCT:
      handleProductMessage(msg);
      break;
    case Type.INVENTORY:
      handleInventoryMessage(msg);
      break;
    default:
      sendError(`Unsupported message type: ${msg.type}`);
  }
}

function handleProductMessage(msg: Message): void {
  const products:Product[] = [
    { id: '1', name: 'Product 1', price: 100, quantity: 10, timestamp: new Date().toISOString() },
    { id: '2', name: 'Product 2', price: 200, quantity: 20, timestamp: new Date().toISOString()
  }];

  const message:Message = {
    type: Type.PRODUCT,
    message_id: msg.message_id,
    data: products,
    status: Status.SUCCESS,
    timestamp: new Date().toISOString()
  };

  sendWSMessage(message);
}

function handleInventoryMessage(msg: Message): void {
  ws.send(JSON.stringify({ status: 'success', message: 'Inventory message received.' }));
}

function sendError(message: string): void {
  const error:Message = {
    type: Type.PRODUCT,
    message_id: 'error',
    data: message,
    status: Status.ERROR,
    timestamp: new Date().toISOString()
  };

  sendWSMessage(error);
}