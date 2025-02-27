import { Message, Product, Status, Action, ProductPayload, Type, InventoryItem, InventoryPayload, ModeSwitch, SyncPayload, Component } from './types/types';
import {config} from "dotenv";
import { initWSServer, sendWSMessage } from './utils/websocket-server';
import {
  addProduct, 
  getAllProducts,
  getProductById,
  deleteProduct, 
  initDB, 
  updateProduct, 
  getInventory, 
  updateInventoryItem, 
  addInventoryItem,
  deleteInventoryItem,
  getInventoryById,
  inventoryIncrement,
  inventoryDecrement,
  syncDB
} from "./utils/db-connector";

config();
const PORT = parseInt(process.env.PORT || '') || 8000;
const db = initDB();
const ws = initWSServer(PORT, handleMessage);
let mode;

async function handleMessage(msg: Message): Promise<void> {
  switch (msg.action) {
    case Action.PRODUCT_GET_ALL:
      await handleProductGetAll(msg);
      break;
    case Action.INVENTORY_GET_ALL:
      await handleInventoryGetAll(msg);
      break;
    case Action.PRODUCT_ADD_EDIT:
      await handleProductAddEdit(msg);
      break;
    case Action.PRODUCT_GET_BY_ID:
      await handleProductGetById(msg);
      break;
    case Action.PRODUCT_DELETE:
      await handleProductDelete(msg);
      break;
    case Action.INVENTORY_GET_ALL:
      await handleInventoryGetAll(msg);
      break;
    case Action.INVENTORY_ADD_EDIT:
      await handleInventoryAddEdit(msg);
      break;
    case Action.INVENTORY_DELETE: 
      await handleInventoryDelete(msg);
      break;
    case Action.INVENTORY_GET_BY_ID: 
      await handleInventoryGetById(msg);
      break;
    case Action.INVENTORY_IN:
      await handleInventoryIn(msg);
      break;
    case Action.INVENTORY_OUT:
      await handleInventoryOut(msg);
      break;
    case Action.MODE_SWITCH:
      mode = (msg.payload as ModeSwitch).mode;
      break;
    case Action.SYNC:
      await handleSync(msg);
      break;
    case Action.TAG_WRITE:
      handleTagWriteRequest(msg)
      break
    default:
      // sendError(`Unsupported message type: ${msg.action}`, msg.action);
  }
}


async function handleTagWriteRequest(msg:Message):Promise<void> {

  const product_id = msg.payload
  const product = await getProductById(product_id!.toString())

  const message:Message = {
    action: Action.TAG_WRITE,
    type: Type.REQUEST,
    message_id: msg.message_id,
    timestamp: Date.now().toString(),
    component:Component.IOT,
    payload: {products:product, timestamp:Date.now().toString(), product_id:product_id?.toString()}
  }
  
  sendWSMessage(message)
}


async function handleProductGetAll(msg: Message): Promise<void> {
  const products:Product[] = await getAllProducts();

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

async function handleProductGetById(msg: Message): Promise<void> {
  const { product_id } = msg.payload as ProductPayload;
  const result = await getProductById(product_id!);

  const message: Message = {
    action: Action.PRODUCT_GET_BY_ID,
    type: Type.RESPONSE,
    message_id: msg.message_id,
    payload: { products: result, timestamp: new Date().toISOString() },
    status: Status.SUCCESS,
    timestamp: new Date().toISOString()
  };

  sendWSMessage(message);
}

async function handleProductDelete(msg: Message): Promise<void> {
  const { product_id } = msg.payload as ProductPayload;
  const result = await deleteProduct(product_id!);

  const message: Message = {
    action: Action.PRODUCT_DELETE,
    type: Type.RESPONSE,
    message_id: msg.message_id,
    payload: { product_id: product_id, timestamp: new Date().toISOString() },
    status: Status.SUCCESS,
    timestamp: new Date().toISOString()
  };
}







async function handleInventoryGetAll(msg: Message): Promise<void> {

  const inventory_items = await getInventory();

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


async function handleProductAddEdit(msg: Message): Promise<void>{
  const productPayload:ProductPayload=msg.payload as ProductPayload
  const product:Product=productPayload.products![0]
  if (productPayload.product_id){
    const result = await updateProduct(product.id,product.name,product.price,product.quantity);
    const message:Message = {
      action: Action.PRODUCT_ADD_EDIT,
      type: Type.RESPONSE,
      message_id: msg.message_id,
      status: Status.SUCCESS,
      payload: {products:result, timestamp: new Date().toString()},
      timestamp: new Date().toISOString()
    };
    sendWSMessage(message)
  }else{
    await addProduct(product.name,product.price,product.quantity);
      const message:Message = {
        action: Action.PRODUCT_ADD_EDIT,
        type: Type.RESPONSE,
        message_id: msg.message_id,
        status: Status.SUCCESS,
        timestamp: new Date().toISOString()
      };
      sendWSMessage(message)
    }
    
  
  }

  async function handleInventoryAddEdit(msg: Message): Promise<void> {
    const inventoryPayload = msg.payload as InventoryPayload;
    const inventory_item = inventoryPayload.inventory_items![0];
  
    if (inventoryPayload.inventory_id) {
      const result = await updateInventoryItem(inventoryPayload.inventory_id, inventory_item.product_id, inventory_item.product_name!, inventory_item.quantity);
  
      const message: Message = {
        action: Action.INVENTORY_ADD_EDIT,
        type: Type.RESPONSE,
        message_id: msg.message_id,
        payload: { inventory_items: result, timestamp: new Date().toISOString() },
        status: Status.SUCCESS,
        timestamp: new Date().toISOString()
      };
  
      sendWSMessage(message);
    } else {
      const inventory_items = await addInventoryItem(inventory_item.product_id, inventory_item.product_name!, inventory_item.quantity);
  
      const message: Message = {
        action: Action.INVENTORY_ADD_EDIT,
        type: Type.RESPONSE,
        message_id: msg.message_id,
        status: Status.SUCCESS,
        timestamp: new Date().toISOString()
      };
  
      sendWSMessage(message);
    }
  }

  async function handleInventoryDelete(msg: Message): Promise<void> {
    const { inventory_id } = msg.payload as InventoryPayload;
    const result = await deleteInventoryItem(inventory_id!);
  
    const message: Message = {
      action: Action.INVENTORY_DELETE,
      type: Type.RESPONSE,
      message_id: msg.message_id,
      payload: { inventory_id, timestamp : new Date().toISOString() },
      status: Status.SUCCESS,
      timestamp: new Date().toISOString()
    };
    sendWSMessage(message);}

    async function handleInventoryGetById(msg: Message): Promise<void> {
      const { inventory_id } = msg.payload as InventoryPayload;
      const result = await getInventoryById(inventory_id!);
    
      const message: Message = {
        action: Action.INVENTORY_GET_BY_ID,
        type: Type.RESPONSE,
        message_id: msg.message_id,
        payload: { inventory_items: result, timestamp: new Date().toISOString() },
        status: Status.SUCCESS,
        timestamp: new Date().toISOString()
      };
    
      sendWSMessage(message);
    }

    async function handleInventoryIn(msg: Message): Promise<void> {
      const { inventory_items } = msg.payload as InventoryPayload;
      const { quantity, product_name, product_id } = inventory_items![0];
      const result = await inventoryIncrement(product_id, quantity, product_name!);
    
      const message: Message = {
        action: Action.INVENTORY_IN,
        type: Type.RESPONSE,
        message_id: msg.message_id,
        payload: { inventory_items: result, timestamp: new Date().toISOString() },
        status: Status.SUCCESS,
        timestamp: new Date().toISOString()
      };
    
      sendWSMessage(message);
    }

    async function handleInventoryOut(msg: Message): Promise<void> {
      const { inventory_id, inventory_items } = msg.payload as InventoryPayload;
      const {product_id, product_name, quantity} = inventory_items![0];
      const result = await inventoryDecrement(product_id,quantity, product_name!);

      const message: Message = {
        action: Action.INVENTORY_OUT,
        type: Type.RESPONSE,
        message_id: msg.message_id,
        payload: { inventory_items: result, timestamp: new Date().toISOString() },
        status: Status.SUCCESS,
        timestamp: new Date().toISOString()
      };

      sendWSMessage(message);
    }

    async function handleSync(msg: Message): Promise<void> {
      const { products:p, inventory:i } = msg.payload as SyncPayload;
      const {products,inventory} = await syncDB(p, i);
    
      const message: Message = {
        action: Action.SYNC,
        type: Type.RESPONSE,
        message_id: msg.message_id,
        status: Status.SUCCESS,
        payload: {products, inventory, timestamp:Date.now().toString()} as SyncPayload,
        timestamp: new Date().toISOString()
      };
    
      sendWSMessage(message);
    }
    