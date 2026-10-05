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
  { id: 'cat_services', name: 'Services', description: 'Repairs, graphic design, technical & consulting services' }
];

export const SAMPLE_BUYER_REQUIREMENTS = [
  {
    id: 'req_demo_iphone14',
    buyerId: 'demo_buyer_rohit',
    buyerName: 'Rohit Sharma',
    buyerEmail: 'rohit.sharma@example.com',
    title: 'Looking for a used iPhone 14',
    categoryId: 'cat_mobiles',
    categoryName: 'Mobile Phones',
    description: 'Looking for a good condition iPhone 14, preferably 128GB with battery health above 85%. Original bill and box preferred.',
    budget: 35000,
    location: 'Ahmedabad',
    urgency: 'Within 1 week',
    imageUrl: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&auto=format&fit=crop&q=80',
    status: 'active',
    offerCount: 2
  },
  {
    id: 'req_demo_studytable',
    buyerId: 'demo_buyer_priya',
    buyerName: 'Priya Patel',
    buyerEmail: 'priya.patel@example.com',
    title: 'Need a study table',
    categoryId: 'cat_furniture',
    categoryName: 'Furniture',
    description: 'Need a solid wooden or metal study desk with at least 1 drawer for a dual monitor work setup.',
    budget: 5000,
    location: 'Ahmedabad',
    urgency: 'This month',
    imageUrl: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=600&auto=format&fit=crop&q=80',
    status: 'active',
    offerCount: 1
  },
  {
    id: 'req_demo_laptop',
    buyerId: 'demo_buyer_amit',
    buyerName: 'Amit Verma',
    buyerEmail: 'amit.verma@example.com',
    title: 'Looking for a second-hand laptop',
    categoryId: 'cat_laptops',
    categoryName: 'Laptops',
    description: 'Searching for Intel i5/i7 11th Gen or Ryzen 5 laptop, 16GB RAM, SSD for development and multitasking.',
    budget: 45000,
    location: 'Ahmedabad',
    urgency: 'Within 2 weeks',
    imageUrl: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&auto=format&fit=crop&q=80',
    status: 'active',
    offerCount: 1
  },
  {
    id: 'req_demo_sonyheadphones',
    buyerId: 'demo_buyer_neha',
    buyerName: 'Neha Joshi',
    buyerEmail: 'neha.joshi@example.com',
    title: 'Looking for Sony WH-1000XM4 Noise Cancelling Headphones',
    categoryId: 'cat_electronics',
    categoryName: 'Electronics',
    description: 'Need active noise cancelling headphones in working condition for office work and focus sessions.',
    budget: 16000,
    location: 'Ahmedabad',
    urgency: 'Immediate',
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80',
    status: 'fulfilled',
    offerCount: 2
  }
];

export const SAMPLE_PITCHES = [
  {
    id: 'pitch_demo_iphone_1',
    requirementId: 'req_demo_iphone14',
    buyerId: 'demo_buyer_rohit',
    sellerId: 'demo_seller_patel',
    sellerName: 'Patel Electronics',
    sellerEmail: 'patel.electronics@example.com',
    sellerPhone: '+91 98250 12345',
    sellerLocation: 'C.G. Road, Ahmedabad',
    offerPrice: 32500,
    description: 'iPhone 14 128GB Starlight color, battery health 89%, original box & USB-C cable available. No scratches.',
    condition: 'Good',
    deliveryTime: '2 days (Store pickup or Hand delivery)',
    sellerNote: 'Verified handset with 15 days shop testing warranty.',
    status: 'pending'
  },
  {
    id: 'pitch_demo_iphone_2',
    requirementId: 'req_demo_iphone14',
    buyerId: 'demo_buyer_rohit',
    sellerId: 'demo_seller_istore',
    sellerName: 'Ahmedabad iStore Hub',
    sellerEmail: 'istore.ahmedabad@example.com',
    sellerPhone: '+91 98980 67890',
    sellerLocation: 'Vastrapur, Ahmedabad',
    offerPrice: 34000,
    description: 'iPhone 14 128GB Midnight Black, 94% battery health, retail unit with invoice and tempered glass applied.',
    condition: 'Like New',
    deliveryTime: '1 day',
    sellerNote: 'Original invoice copy included. 1 month replacement warranty on motherboard.',
    status: 'pending'
  },
  {
    id: 'pitch_demo_table_1',
    requirementId: 'req_demo_studytable',
    buyerId: 'demo_buyer_priya',
    sellerId: 'demo_seller_urban',
    sellerName: 'Urban Craft Furniture',
    sellerEmail: 'urbancraft@example.com',
    sellerPhone: '+91 97230 45678',
    sellerLocation: 'Maninagar, Ahmedabad',
    offerPrice: 4200,
    description: 'Engineered Sheesham finish study table with cable grommet and 1 lockable drawer. Dimensions 3.5ft x 2ft.',
    condition: 'Brand New',
    deliveryTime: '3 days (Free doorstep delivery in Ahmedabad)',
    sellerNote: 'Directly from local warehouse at wholesale rate.',
    status: 'pending'
  },
  {
    id: 'pitch_demo_laptop_1',
    requirementId: 'req_demo_laptop',
    buyerId: 'demo_buyer_amit',
    sellerId: 'demo_seller_gujaratlaptop',
    sellerName: 'Gujarat Laptop Care',
    sellerEmail: 'contact@gujaratlaptop.com',
    sellerPhone: '+91 98790 11223',
    sellerLocation: 'Navrangpura, Ahmedabad',
    offerPrice: 42000,
    description: 'Dell Latitude 5420 Business Series - Intel Core i5 11th Gen, 16GB DDR4 RAM, 512GB NVMe SSD, Backlit keyboard, 1080p display.',
    condition: 'Refurbished - Grade A',
    deliveryTime: '2 days',
    sellerNote: 'Includes original Dell 65W Type-C adapter and 6 months written store warranty.',
    status: 'pending'
  },
  {
    id: 'pitch_demo_headphones_1',
    requirementId: 'req_demo_sonyheadphones',
    buyerId: 'demo_buyer_neha',
    sellerId: 'demo_seller_audioking',
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

export const SAMPLE_USERS = [
  {
    uid: 'demo_seller_patel',
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
    uid: 'demo_seller_audioking',
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
    uid: 'demo_buyer_rohit',
    name: 'Rohit Sharma',
    email: 'rohit.sharma@example.com',
    photoURL: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    role: 'buyer',
    phone: '+91 99090 12345',
    location: 'Ahmedabad',
    status: 'active'
  }
];

export const SAMPLE_REVIEWS = [
  {
    id: 'rev_demo_1',
    sellerId: 'demo_seller_audioking',
    buyerId: 'demo_buyer_neha',
    buyerName: 'Neha Joshi',
    requirementId: 'req_demo_sonyheadphones',
    dealId: 'deal_demo_sony_1',
    rating: 5,
    comment: 'Great deal! Genuine Sony headphones with carry pouch. Seller verified everything during in-person handover.',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
  }
];

export const SAMPLE_DEALS = [
  {
    id: 'deal_demo_sony_1',
    requirementId: 'req_demo_sonyheadphones',
    requirementTitle: 'Looking for Sony WH-1000XM4 Noise Cancelling Headphones',
    buyerId: 'demo_buyer_neha',
    buyerName: 'Neha Joshi',
    sellerId: 'demo_seller_audioking',
    sellerName: 'Audio King Gadgets',
    pitchId: 'pitch_demo_headphones_1',
    dealPrice: 14500,
    status: 'completed',
    reviewed: true
  }
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
 * Inserts clean demo records into Firestore with predictable IDs
 * @param {boolean} force - If true, overwrites / ensures all demo records are present
 * @returns {Promise<{success: boolean, message: string}>}
 */
export const seedDemoData = async (force = false) => {
  try {
    const isSeeded = await checkIsDatabaseSeeded();
    if (isSeeded && !force) {
      return { success: true, message: 'Database is already initialized.' };
    }

    // 1. Seed Categories
    for (const cat of INITIAL_CATEGORIES) {
      await setDoc(doc(db, 'categories', cat.id), {
        ...cat,
        isActive: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }, { merge: true });
    }

    // 2. Seed Sample Users
    for (const user of SAMPLE_USERS) {
      await setDoc(doc(db, 'users', user.uid), {
        ...user,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }, { merge: true });
    }

    // 3. Seed Buyer Requirements
    for (const req of SAMPLE_BUYER_REQUIREMENTS) {
      await setDoc(doc(db, 'requirements', req.id), {
        ...req,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }, { merge: true });
    }

    // 4. Seed Pitches
    for (const pitch of SAMPLE_PITCHES) {
      await setDoc(doc(db, 'pitches', pitch.id), {
        ...pitch,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }, { merge: true });
    }

    // 5. Seed Deals
    for (const deal of SAMPLE_DEALS) {
      await setDoc(doc(db, 'deals', deal.id), {
        ...deal,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }, { merge: true });
    }

    // 6. Seed Reviews
    for (const rev of SAMPLE_REVIEWS) {
      await setDoc(doc(db, 'reviews', rev.id), {
        ...rev,
        createdAt: serverTimestamp()
      }, { merge: true });
    }

    // 7. Seed Marker Document
    await setDoc(doc(db, '_system', 'seed_metadata'), {
      seeded: true,
      seededAt: serverTimestamp(),
      version: '1.0.0',
      description: 'Seed data for Need Connect platform'
    });

    return { 
      success: true, 
      message: 'Demo data initialized successfully in database.' 
    };
  } catch (error) {
    console.error('Error seeding demo data:', error);
    return { 
      success: false, 
      message: `Failed to initialize data: ${error.message}` 
    };
  }
};
