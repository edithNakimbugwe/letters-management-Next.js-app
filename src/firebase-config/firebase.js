// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAcBt-e-4imy562omNNqrIB32TSl3u6dgI",
  authDomain: "letter-lms.firebaseapp.com",
  projectId: "letter-lms",
  storageBucket: "letter-lms.firebasestorage.app",
  messagingSenderId: "698664269228",
  appId: "1:698664269228:web:48c2eb35e60154e59fb609",
  measurementId: "G-WJP93JL7XK"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore(app);

// Initialize Auth
const auth = getAuth(app);

// Initialize Storage
const storage = getStorage(app);

// Test Firebase connection
console.log("Firebase initialized successfully");
console.log("Project ID:", firebaseConfig.projectId);
console.log("Auth Domain:", firebaseConfig.authDomain);

// Initialize Analytics only on client side
let analytics = null;
if (typeof window !== "undefined") {
  try {
    analytics = getAnalytics(app);
  } catch (error) {
    console.log("Analytics not available:", error);
  }
}

export { db, auth, analytics, storage };





