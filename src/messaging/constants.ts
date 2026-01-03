// RabbitMQ Client Tokens
export const CATALOG_CLIENT = 'CATALOG_CLIENT';

// RabbitMQ Message Patterns
export const CATALOG_PATTERNS = {
  CREATE_PRODUCT: 'product/create',
  UPDATE_PRODUCT: 'product/update',
  FIND_ONE_PRODUCT: 'product/find-one',
  FIND_ALL_PRODUCTS: 'product/find-all',
  REMOVE_PRODUCT: 'product/remove',
} as const;

// RabbitMQ Event Patterns
export const CATALOG_EVENTS = {
  PRODUCT_CREATED: 'product.created',
  PRODUCT_UPDATED: 'product.updated',
  PRODUCT_DELETED: 'product.deleted',
} as const;

// Inventory Message Patterns
export const INVENTORY_PATTERNS = {
  CREATE: 'inventory/create',
  UPDATE: 'inventory/update',
  FIND_ONE: 'inventory/find-one',
  FIND_ALL: 'inventory/find-all',
  REMOVE: 'inventory/remove',
  CHECK_AVAILABILITY: 'inventory/check-availability',
  RESERVE: 'inventory/reserve',
  RELEASE: 'inventory/release',
} as const;

// Inventory Event Patterns
export const INVENTORY_EVENTS = {
  CREATED: 'inventory.created',
  UPDATED: 'inventory.updated',
  RESERVED: 'inventory.reserved',
  RELEASED: 'inventory.released',
  LOW_STOCK: 'inventory.low-stock',
} as const;
