import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase configuration
// IMPORTANT: Replace these values with your own Firebase project credentials
// Get these from Firebase Console > Project Settings > Your apps > Web app
const firebaseConfig = {
  apiKey: "AIzaSyADpPN_zCYrVqk-K4KU9HZbwCoqEfeF0Fc",
  authDomain: "attendance-tracker-b81a5.firebaseapp.com",
  projectId: "attendance-tracker-b81a5",
  storageBucket: "attendance-tracker-b81a5.firebasestorage.app",
  messagingSenderId: "877176632982",
  appId: "1:877176632982:web:12f989976cfd2e814bf4b7",
  measurementId: "G-Y1HXHHN7F7"
};

// Check if Firebase is configured
const isConfigured = firebaseConfig.apiKey !== "YOUR_API_KEY";

// Initialize Firebase
let app = null;
let auth = null;
let db = null;
let googleProvider = null;

if (isConfigured) {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  googleProvider = new GoogleAuthProvider();
  googleProvider.setCustomParameters({
    prompt: 'select_account'
  });
}

export { auth, db, googleProvider, isConfigured };
