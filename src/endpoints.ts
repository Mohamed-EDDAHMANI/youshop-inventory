// List of endpoints and allowed roles for inventory-service
export const INVENTORY_ENDPOINTS = {
  '/inventory/list': ['user', 'admin'],
  '/inventory/item': ['user', 'admin'],
  '/inventory/admin': ['admin']
};
