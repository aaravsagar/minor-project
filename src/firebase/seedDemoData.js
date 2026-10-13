import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from './config.js';

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

export const INITIAL_BUYER_REQUIREMENTS = [
  {
    id: 'req_seed_iphone14',
    buyerId: 'user_seed_rohit',
    buyerName: 'Rohit Sharma',
    buyerEmail: 'rohit.sharma@example.com',
    title: 'iPhone 14 128GB (Starlight or Midnight)',
    description: 'Looking for iPhone 14 128GB in clean scratchless condition. Battery health 85%+ preferred. Box and cable required.',
    categoryId: 'cat_mobiles',
    categoryName: 'Mobile Phones',
    budget: 34000,
    quantity: 1,
    location: 'C.G. Road, Ahmedabad',
    urgency: 'Within 1 week',
    status: 'active',
    offerCount: 2
  },
  {
    id: 'req_seed_laptop',
    buyerId: 'user_seed_amit',
    buyerName: 'Amit Shah',
    buyerEmail: 'amit.shah@example.com',
    title: 'Dell Latitude 5420 Business Series (16GB RAM, SSD)',
    description: 'Need a reliable Core i5 11th Gen business laptop with 16GB DDR4 RAM and 512GB NVMe SSD for office multitasking and data analysis.',
    categoryId: 'cat_laptops',
    categoryName: 'Laptops',
    budget: 45000,
    quantity: 1,
    location: 'Navrangpura, Ahmedabad',
    urgency: 'Immediate',
    status: 'active',
    offerCount: 1
  },
  {
    id: 'req_seed_studytable',
    buyerId: 'user_seed_priya',
    buyerName: 'Priya Patel',
    buyerEmail: 'priya.patel@example.com',
    title: 'Solid Sheesham Wood Study / Work Desk',
    description: 'Looking for a sturdy wooden study desk with 1 drawer and cable grommet for home study setup. Size roughly 3.5ft x 2ft.',
    categoryId: 'cat_furniture',
    categoryName: 'Furniture',
    budget: 4500,
    quantity: 1,
    location: 'Vastrapur, Ahmedabad',
    urgency: 'Within 2 weeks',
    status: 'active',
    offerCount: 1
  },
  {
    id: 'req_seed_headphones',
    buyerId: 'user_seed_neha',
    buyerName: 'Neha Joshi',
    buyerEmail: 'neha.joshi@example.com',
    title: 'Sony WH-1000XM4 Noise Cancelling Headphones',
    description: 'Looking for Sony WH-1000XM4 ANC wireless headphones with case and accessories.',
    categoryId: 'cat_electronics',
    categoryName: 'Electronics',
    budget: 16000,
    quantity: 1,
    location: 'Satellite, Ahmedabad',
    urgency: 'Immediate',
    status: 'fulfilled',
    offerCount: 1
  }
];

export const INITIAL_PITCHES = [
  {
    id: 'pitch_seed_iphone_1',
    requirementId: 'req_seed_iphone14',
    buyerId: 'user_seed_rohit',
    sellerId: 'user_seed_patel',
    sellerName: 'Patel Electronics',
    sellerEmail: 'patel.electronics@example.com',
    sellerPhone: '+91 98250 12345',
    sellerLocation: 'C.G. Road, Ahmedabad',
    offerPrice: 32500,
    description: 'iPhone 14 128GB Starlight color, battery health 89%, original box & USB-C cable available. Zero scratches.',
    condition: 'Good',
    deliveryTime: '2 days (Hand delivery in Ahmedabad)',
    sellerNote: 'Verified handset with 15 days shop testing warranty.',
    status: 'pending'
  },
  {
    id: 'pitch_seed_iphone_2',
    requirementId: 'req_seed_iphone14',
    buyerId: 'user_seed_rohit',
    sellerId: 'user_seed_istore',
    sellerName: 'Ahmedabad iStore Hub',
    sellerEmail: 'istore.ahmedabad@example.com',
    sellerPhone: '+91 98980 67890',
    sellerLocation: 'Vastrapur, Ahmedabad',
    offerPrice: 33800,
    description: 'iPhone 14 128GB Midnight, 93% battery health, retail unit with original bill & tempered glass applied.',
    condition: 'Like New',
    deliveryTime: '1 day',
    sellerNote: 'Original invoice included. 1 month warranty.',
    status: 'pending'
  },
  {
    id: 'pitch_seed_laptop_1',
    requirementId: 'req_seed_laptop',
    buyerId: 'user_seed_amit',
    sellerId: 'user_seed_gujaratlaptop',
    sellerName: 'Gujarat Laptop Care',
    sellerEmail: 'contact@gujaratlaptop.com',
    sellerPhone: '+91 98790 11223',
    sellerLocation: 'Navrangpura, Ahmedabad',
    offerPrice: 42000,
    description: 'Dell Latitude 5420 - Core i5 11th Gen, 16GB DDR4 RAM, 512GB NVMe SSD, backlit keyboard, FHD IPS display.',
    condition: 'Refurbished - Grade A',
    deliveryTime: '2 days',
    sellerNote: 'Includes original Dell 65W Type-C charger and 6 months written warranty.',
    status: 'pending'
  },
  {
    id: 'pitch_seed_table_1',
    requirementId: 'req_seed_studytable',
    buyerId: 'user_seed_priya',
    sellerId: 'user_seed_urban',
    sellerName: 'Urban Craft Furniture',
    sellerEmail: 'urbancraft@example.com',
    sellerPhone: '+91 97230 45678',
    sellerLocation: 'Maninagar, Ahmedabad',
    offerPrice: 4200,
    description: 'Engineered Sheesham finish study table with cable grommet and 1 lockable drawer. Dimensions 3.5ft x 2ft.',
    condition: 'Brand New',
    deliveryTime: '3 days (Doorstep delivery in Ahmedabad)',
    sellerNote: 'Directly from local warehouse at manufacturer rate.',
    status: 'pending'
  },
  {
    id: 'pitch_seed_headphones_1',
    requirementId: 'req_seed_headphones',
    buyerId: 'user_seed_neha',
    sellerId: 'user_seed_audioking',
    sellerName: 'Audio King Gadgets',
    sellerEmail: 'audioking.ahm@example.com',
    sellerPhone: '+91 98240 99887',
    sellerLocation: 'Satellite, Ahmedabad',
    offerPrice: 14500,
    description: 'Sony WH-1000XM4 Silver edition, with original travel case, 3.5mm cable and airplane adapter. Battery backup 28+ hrs.',
    condition: 'Excellent',
    deliveryTime: 'Same day handover',
    sellerNote: 'Genuine buyer deal concluded.',
    status: 'accepted'
  }
];

export const INITIAL_USERS = [
  {
    uid: 'user_seed_patel',
    name: 'Patel Electronics',
    email: 'patel.electronics@example.com',
    photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    role: 'seller',
    phone: '+91 98250 12345',
    location: 'C.G. Road, Ahmedabad',
    categories: ['cat_mobiles', 'cat_electronics', 'cat_laptops'],
    trustScore: 4.8,
    totalDeals: 12,
    status: 'active'
  },
  {
    uid: 'user_seed_audioking',
    name: 'Audio King Gadgets',
    email: 'audioking.ahm@example.com',
    photoURL: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    role: 'seller',
    phone: '+91 98240 99887',
    location: 'Satellite, Ahmedabad',
    categories: ['cat_electronics'],
    trustScore: 5.0,
    totalDeals: 8,
    status: 'active'
  },
  {
    uid: 'user_seed_rohit',
    name: 'Rohit Sharma',
    email: 'rohit.sharma@example.com',
    photoURL: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    role: 'buyer',
    phone: '+91 99090 12345',
    location: 'Ahmedabad',
    status: 'active'
  }
];

export const INITIAL_DEALS = [
  {
    id: 'deal_seed_sony_1',
    requirementId: 'req_seed_headphones',
    requirementTitle: 'Sony WH-1000XM4 Noise Cancelling Headphones',
    buyerId: 'user_seed_neha',
    buyerName: 'Neha Joshi',
    sellerId: 'user_seed_audioking',
    sellerName: 'Audio King Gadgets',
    pitchId: 'pitch_seed_headphones_1',
    dealPrice: 14500,
    status: 'completed',
    reviewed: true
  }
];

export const INITIAL_REVIEWS = [
  {
    id: 'rev_seed_1',
    sellerId: 'user_seed_audioking',
    buyerId: 'user_seed_neha',
    buyerName: 'Neha Joshi',
    requirementId: 'req_seed_headphones',
    dealId: 'deal_seed_sony_1',
    rating: 5,
    comment: 'Great deal! Genuine Sony headphones with carry pouch. Seller verified everything during in-person handover.',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
  }
];

/**
 * Checks if the Firestore database already contains seed data
 * @returns {Promise<boolean>}
 */
export const checkIsDatabaseSeeded = async () => {
  try {
    const metaDoc = await getDoc(doc(db, '_system', 'seed_metadata'));
    if (metaDoc.exists() && metaDoc.data()?.mockDataSeeded) {
      return true;
    }
    const reqsSnap = await getDocs(collection(db, 'requirements'));
    return !reqsSnap.empty;
  } catch (error) {
    console.warn('Error checking seed status:', error);
    return false;
  }
};

/**
 * Seeds a clean, realistic set of demo records into Firestore.
 * Conforms to category price limits and provides real sample data
 * for requirements, pitches, users, deals, and reviews without cluttering.
 *
 * @param {boolean} force - If true, re-writes seed documents
 * @returns {Promise<{success: boolean, message: string}>}
 */
export const seedDemoData = async (force = false) => {
  try {
    const isSeeded = await checkIsDatabaseSeeded();
    if (isSeeded && !force) {
      return { success: true, message: 'Database is already seeded.' };
    }

    // 1. Categories
    for (const cat of INITIAL_CATEGORIES) {
      await setDoc(doc(db, 'categories', cat.id), {
        ...cat,
        isActive: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }, { merge: true });
    }

    // 2. Users
    for (const user of INITIAL_USERS) {
      await setDoc(doc(db, 'users', user.uid), {
        ...user,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }, { merge: true });
    }

    // 3. Buyer Requirements
    for (const req of INITIAL_BUYER_REQUIREMENTS) {
      await setDoc(doc(db, 'requirements', req.id), {
        ...req,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }, { merge: true });
    }

    // 4. Seller Pitches
    for (const pitch of INITIAL_PITCHES) {
      await setDoc(doc(db, 'pitches', pitch.id), {
        ...pitch,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }, { merge: true });
    }

    // 5. Deals
    for (const deal of INITIAL_DEALS) {
      await setDoc(doc(db, 'deals', deal.id), {
        ...deal,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }, { merge: true });
    }

    // 6. Reviews
    for (const rev of INITIAL_REVIEWS) {
      await setDoc(doc(db, 'reviews', rev.id), {
        ...rev,
        createdAt: serverTimestamp()
      }, { merge: true });
    }

    // 7. Seed Marker Document
    await setDoc(doc(db, '_system', 'seed_metadata'), {
      seeded: true,
      mockDataSeeded: true,
      seededAt: serverTimestamp(),
      version: '2.1.0',
      description: 'Need Connect balanced seed data (categories, requirements, pitches, deals, users)'
    });

    return { 
      success: true, 
      message: 'Clean mock data successfully seeded into Firestore.' 
    };
  } catch (error) {
    console.error('Error seeding data:', error);
    return { 
      success: false, 
      message: `Failed to seed data: ${error.message}` 
    };
  }
};
