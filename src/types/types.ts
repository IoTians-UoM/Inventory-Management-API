enum Status {
    SUCCESS = "success",
    ERROR = "error",
}

enum Type {
    REQUEST = "request",
    RESPONSE = "response",
}

enum Action {
    // Product Actions
    PRODUCT_ADD_EDIT = "product_add_edit",
    PRODUCT_DELETE = "product_delete",
    PRODUCT_GET_ALL = "product_get_all",
    PRODUCT_GET_BY_ID = "product_get_by_id",

    // Inventory Actions
    INVENTORY_ADD_EDIT = "inventory_add_edit",
    INVENTORY_DELETE = "inventory_delete",
    INVENTORY_GET_ALL = "inventory_get_all",
    INVENTORY_GET_BY_ID = "inventory_get_by_id",
    INVENTORY_IN = "inventory_in",
    INVENTORY_OUT = "inventory_out",

    // Tag Write Actions
    TAG_WRITE = "tag_write",

    // Sync Actions
    SYNC = "sync",

    // Mode Switch
    MODE_SWITCH = "mode_switch",
}

enum Component {
    WEB = 'web',
    IOT = 'iot',
    API = 'api',
}

enum Mode {
    INVENTORY_IN = "inventory_in",
    INVENTORY_OUT = "inventory_out",
    TAG_WRITE = "tag_write",
}

type Message = {
    action: Action,
    type: Type,
    component?: Component,
    message_id: string,
    payload?: ProductPayload | InventoryPayload | ModeSwitch | SyncPayload | string,
    status?:Status,
    timestamp: string,
}

type Product = {
    id: string,
    name: string,
    price: number,
    quantity: number,
    timestamp: string,
}

type InventoryItem = {
    product_id: string,
    product_name?: string,
    quantity: number,
    timestamp: string,
}

type ProductPayload = {
    product_id?: string,
    products?: Product[],
    timestamp: string,
}

type InventoryPayload = {
    inventory_id?: string,
    inventory_items?: InventoryItem[],
    timestamp: string,
}

type ModeSwitch = {
    mode: Mode,
    timestamp: string,
}

type SyncPayload = {
    products: Product[],
    inventory: InventoryItem[],
    timestamp: string,
}   


export {Status, Type, Action, Mode, Message, Product, InventoryItem, ProductPayload, InventoryPayload, ModeSwitch, SyncPayload, Component};