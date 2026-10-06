import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Production Firebase Configuration provided in project specification
const firebaseConfig = {
  apiKey: "AIzaSyD2qMY0wzAIdund43GqGJfAdCyFNN72B1E",
  authDomain: "welcro-7ffb3.firebaseapp.com",
  projectId: "welcro-7ffb3",
  storageBucket: "welcro-7ffb3.firebasestorage.app",
  messagingSenderId: "114215903755",
  appId: "1:114215903755:web:b6efc20a18b2efaf9add0e",
  measurementId: "G-FFZ9W1XKE8"
};

// Singleton initialization to prevent multiple instances
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
