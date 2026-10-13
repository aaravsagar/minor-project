/**
 * Business-defined category price and quantity limits for Need Connect.
 * Configurable boundaries prevent unrealistic requirements (e.g. ₹200 laptop).
 * Minimum prices are set per category based on real market entry points in India.
 */
export const CATEGORY_PRICE_LIMITS = {
  cat_laptops: {
    min: 5000,
    max: 500000,
    name: 'Laptops',
    description: 'Laptops, MacBooks, desktops & computer components'
  },
  cat_mobiles: {
    min: 1000,
    max: 300000,
    name: 'Mobile Phones',
    description: 'Smartphones, tablets & mobile accessories'
  },
  cat_electronics: {
    min: 300,
    max: 500000,
    name: 'Electronics',
    description: 'Audio equipment, cameras, gaming consoles & gadgets'
  },
  cat_appliances: {
    min: 1000,
    max: 300000,
    name: 'Home Appliances',
    description: 'Refrigerators, microwaves, washing machines & air conditioners'
  },
  cat_vehicles: {
    min: 2000,
    max: 5000000,
    name: 'Vehicles',
    description: 'Two-wheelers, cars, bicycles & automotive parts'
  },
  cat_furniture: {
    min: 500,
    max: 300000,
    name: 'Furniture',
    description: 'Desks, chairs, sofas, storage units & office furniture'
  },
  cat_fashion: {
    min: 150,
    max: 100000,
    name: 'Fashion',
    description: 'Apparel, watches, footwear & accessories'
  },
  cat_books: {
    min: 50,
    max: 50000,
    name: 'Books',
    description: 'Professional reference books, literature & publications'
  },
  cat_services: {
    min: 200,
    max: 500000,
    name: 'Services',
    description: 'Repairs, graphic design, technical & consulting services'
  },
  cat_sports: {
    min: 100,
    max: 200000,
    name: 'Sports & Fitness',
    description: 'Exercise equipment, sports gear & outdoor accessories'
  },
  cat_groceries: {
    min: 50,
    max: 50000,
    name: 'Groceries & Food',
    description: 'Packaged food, beverages & daily essentials'
  },
  cat_beauty: {
    min: 50,
    max: 50000,
    name: 'Beauty & Personal Care',
    description: 'Skincare, haircare, cosmetics & wellness products'
  },
  cat_toys: {
    min: 100,
    max: 100000,
    name: 'Toys & Games',
    description: 'Board games, educational toys & hobby kits'
  },
  cat_stationery: {
    min: 30,
    max: 50000,
    name: 'Stationery & Office',
    description: 'Pens, notebooks, office supplies & art materials'
  },
  default: {
    min: 100,
    max: 10000000,
    name: 'General',
    description: 'Fallback category threshold'
  }
};

/**
 * Helper to fetch category limits by category ID or name.
 */
export const getCategoryLimits = (categoryId) => {
  if (!categoryId) return CATEGORY_PRICE_LIMITS.default;
  if (CATEGORY_PRICE_LIMITS[categoryId]) return CATEGORY_PRICE_LIMITS[categoryId];

  // Lookup by normalized name
  const normalized = String(categoryId).toLowerCase().trim();
  const found = Object.values(CATEGORY_PRICE_LIMITS).find(c => c.name.toLowerCase() === normalized);
  return found || CATEGORY_PRICE_LIMITS.default;
};

export const MAX_REQUIREMENT_QUANTITY = 10000;
export const MIN_REQUIREMENT_QUANTITY = 1;
