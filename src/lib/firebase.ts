import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  projectId: "warm-rex-446tg",
  appId: "1:740375040555:web:49029db4c15f8d4c4ed06e",
  apiKey: "AIzaSyD9EFhysPu6qu0OcvW5msXW9MDG8_5TbjA",
  authDomain: "warm-rex-446tg.firebaseapp.com",
  storageBucket: "warm-rex-446tg.firebasestorage.app",
  messagingSenderId: "740375040555"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Authentication
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: "select_account"
});

// Initialize Firestore with custom database ID
const customDbId = "ai-studio-globalcareerhuba-e8facf4f-59ea-47c2-b797-080e3c0b557e";
export const db = getFirestore(app, customDbId);

export default app;
