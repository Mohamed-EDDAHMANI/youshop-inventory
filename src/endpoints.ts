
// List of endpoints and allowed roles for inventory-service (Regex based)
export const INVENTORY_ENDPOINTS = [
  {
    pattern: /^\/inventory\/create\/post$/,
    roles: ['admin'], // Créer un nouveau stock
  },
  {
    pattern: /^\/inventory\/find-all\/get$/,
    roles: ['admin', 'client'], // Lister tous les stocks
  },
  {
    pattern: /^\/inventory\/find-one\/[^\/]+\/get$/,
    roles: ['admin', 'client'], // Voir un stock par ID
  },
  {
    pattern: /^\/inventory\/update\/[^\/]+\/put$/,
    roles: ['admin'], // Mettre à jour un stock
  },
  {
    pattern: /^\/inventory\/remove\/[^\/]+\/delete$/,
    roles: ['admin'], // Supprimer un stock
  },
  {
    pattern: /^\/inventory\/reserve\/post$/,
    roles: ['admin', 'client'], // Réserver des items pour une commande
  },
  {
    pattern: /^\/inventory\/release\/post$/,
    roles: ['admin', 'client'], // Libérer stock après expiration/annulation
  },
  {
    pattern: /^\/inventory\/out-of-stock\/get$/,
    roles: ['admin'], // Lister produits en rupture de stock
  },
];
