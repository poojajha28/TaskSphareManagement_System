// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBmCKnwEH2gEGvO0OJnAiBBryUK0GZCXXk",
  authDomain: "taskspheremanagement.firebaseapp.com",
  projectId: "taskspheremanagement",
  storageBucket: "taskspheremanagement.firebasestorage.app",
  messagingSenderId: "706878795439",
  appId: "1:706878795439:web:dcadcad5f9184bbcbd2e5a",
  measurementId: "G-H6RWWZQL20"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const analytics = getAnalytics(app);

export default app;
