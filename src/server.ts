import { Message, Product, Status, Action, ProductPayload, Type } from './types/types';
import {config} from "dotenv";
import {initDB} from "./utils/db-connector";
import { initWSServer, sendWSMessage } from './utils/websocket-server';

config();
const PORT = parseInt(process.env.PORT || '') || 8000;
const db = initDB();
const ws = initWSServer(PORT, handleMessage);

function handleMessage(msg: Message): void {
  switch (msg.action) {
    case Action.PRODUCT_GET_ALL:
      handleProductGetAll(msg);
      break;
    case Action.INVENTORY_GET_ALL:
      handleInventoryGetAll(msg);
      break;
    default:
      sendError(`Unsupported message type: ${msg.action}`, msg.action);
  }
}

function handleProductGetAll(msg: Message): void {
  const products:Product[] = [
    { id: '1', name: 'Product 1', price: 10, quantity: 10, timestamp: new Date().toISOString() },
    { id: '2', name: 'Product 2', price: 20, quantity: 20, timestamp: new Date().toISOString() }
  ]

  const message:Message = {
    action: Action.PRODUCT_GET_ALL,
    type: Type.RESPONSE,
    message_id: msg.message_id,
    payload: {products, timestamp: new Date().toISOString() },
    status: Status.SUCCESS,
    timestamp: new Date().toISOString()
  };

  sendWSMessage(message);
}

function handleInventoryGetAll(msg: Message): void {

  const inventory_items = [
    { product_id: '1', product_name: 'Product 1', quantity: 10, timestamp: new Date().toISOString() },
    { product_id: '2', product_name: 'Product 2', quantity: 20, timestamp: new Date().toISOString() }
  ];

  const message:Message = {
    action: Action.INVENTORY_GET_ALL,
    type: Type.RESPONSE,
    message_id: msg.message_id,
    payload: {inventory_items, timestamp: new Date().toISOString() },
    status: Status.SUCCESS,
    timestamp: new Date().toISOString()
  };

  sendWSMessage(message);
}

function sendError(message: string, action:Action): void {
  const error:Message = {
    type: Type.RESPONSE,
    action,
    message_id: 'error',
    payload: message,
    status: Status.ERROR,
    timestamp: new Date().toISOString()
  };

  sendWSMessage(error);
}