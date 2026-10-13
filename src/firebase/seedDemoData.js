import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from './config';

export const INITIAL_CATEGORIES = [
  { id: 'cat_electronics', name: 'Electronics', description: 'Audio equipment, cameras, gaming consoles & gadgets' },
  { id: 'cat_mobiles', name: 'Mobile Phones', description: 'Smartphones, tablets & mobile accessories' },
  { id: 'cat_laptops', name: 'Laptops', description: 'Laptops, MacBooks, desktops & computer components' },
  { id: 'cat_furniture', name: 'Furniture', description: 'Desks, chairs, sofas, storage units & office furniture' },
  { id: 'cat_vehicles', name: 'Vehicles', description: 'Two-wheelers, cars, bicycles & automotive parts' },
  { id: 'cat_appliances', name: 'Home Appliances', description: 'Refrigerators, microwaves, washing machines & air conditioners' },
  { id: 'cat_fashion', name: 'Fashion', description: 'Apparel, watches, footwear & accessories' },
  { id: 'cat_books', name: 'Books', description: 'Professional reference books, literature & publications' },
  { id: 'cat_services', name: 'Services', description: 'Repairs, graphic design, technical & consulting services' },
  { id: 'cat_sports', name: 'Sports & Fitness', description: 'Exercise equipment, sports gear & outdoor accessories' },
  { id: 'cat_groceries', name: 'Groceries & Food', description: 'Packaged food, beverages & daily essentials' },
  { id: 'cat_beauty', name: 'Beauty & Personal Care', description: 'Skincare, haircare, cosmetics & wellness products' },
  { id: 'cat_toys', name: 'Toys & Games', description: 'Board games, educational toys & hobby kits' },
  { id: 'cat_stationery', name: 'Stationery & Office', description: 'Pens, notebooks, office supplies & art materials' }
];

/**
 * Checks if the Firestore database already contains seed data
 * @returns {Promise<boolean>}
 */
export const checkIsDatabaseSeeded = async () => {
  try {
    const metaDoc = await getDoc(doc(db, '_system', 'seed_metadata'));
    if (metaDoc.exists() && metaDoc.data()?.seeded) {
      return true;
    }
    const catsSnap = await getDocs(collection(db, 'categories'));
    return !catsSnap.empty;
  } catch (error) {
    console.warn('Error checking seed status:', error);
    return false;
  }
};

/**
 * Initializes Firestore with the platform's default categories.
 * Only seeds categories — all requirements, pitches, deals and users
 * are created exclusively by real users through the application.
 * @param {boolean} force - If true, re-writes category documents
 * @returns {Promise<{success: boolean, message: string}>}
 */
export const seedDemoData = async (force = false) => {
  try {
    const isSeeded = await checkIsDatabaseSeeded();
    if (isSeeded && !force) {
      return { success: true, message: 'Database is already initialized.' };
    }

    // Seed Categories only
    for (const cat of INITIAL_CATEGORIES) {
      await setDoc(doc(db, 'categories', cat.id), {
        ...cat,
        isActive: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }, { merge: true });
    }

    // Seed Marker Document
    await setDoc(doc(db, '_system', 'seed_metadata'), {
      seeded: true,
      seededAt: serverTimestamp(),
      version: '2.0.0',
      description: 'Category configuration for Need Connect platform'
    });

    return { 
      success: true, 
      message: 'Platform categories initialized successfully.' 
    };
  } catch (error) {
    console.error('Error initializing categories:', error);
    return { 
      success: false, 
      message: `Failed to initialize categories: ${error.message}` 
    };
  }
};
