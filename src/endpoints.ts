
// List of endpoints and allowed roles for ²-service (Regex based)
export const INVENTORY_ENDPOINTS = [
  {
    pattern: /^\/inventory\/sku\/[^\/]+\/put$/,
    roles: ['admin', 'client'], //Mettre à jour la quantité de stock pour un SKU spécifique
  },
  {
    pattern: /^\/inventory\/reserve\/post$/,
    roles: ['admin', 'client'],//Réserver des items pour une commande
  },
  {
    pattern: /^\/inventory\/release\/post$/,
    roles: ['admin', 'client'],//Libérer stock après expiration/annulation
  },
  {
    pattern: /^\/inventory\/out-of-stock\/get$/,
    roles: ['admin'],//Lister produits en rupture de stock
  },
];
