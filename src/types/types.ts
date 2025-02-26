enum Status {
    SUCCESS = "success",
    ERROR = "error",
}

enum Action {
    ADD_EDIT = "add_edit",
    DELETE = "delete",
}

enum Type {
    TAG_WRITE_REQ = "tag_write_req",
    TAG_WRITE_RESP = "tag_write_resp",
    SYNC = "sync",
    PRODUCT = "product",
    INVENTORY = "inventory",
    PRODUCT_BY_ID = "product_by_id",
    INVENTORY_BY_ID = "inventory_by_id",
    INVENTORY_IN = "inventory_in",
    INVENTORY_OUT = "inventory_out",
}

enum Mode {
    INVENTORY_IN = "inventory_in",
    INVENTORY_OUT = "inventory_out",
    TAG_WRITE = "tag_write",
}

type Message = {
    type:Type,
    message_id: string,
    data: Product | InventoryItem | ProductAction | InventoryAction | ModeSwitch | Product[] | InventoryItem[] | string,
    status:Status,
    timestamp:string,
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

type ProductAction = {
    product_id?: string,
    action: Action,
    product?: Product,
    timestamp: string,
}

type InventoryAction = {
    inventory_id?: string,
    action: Action,
    inventory_item?: InventoryItem,
    timestamp: string,
}

type ModeSwitch = {
    mode: Mode,
    timestamp: string,
}


export {Status, Action, Type, Mode, Message, Product, InventoryItem, ProductAction, InventoryAction, ModeSwitch}