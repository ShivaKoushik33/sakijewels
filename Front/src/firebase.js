// src/firebase.js

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBLOFoMnPVZ1gEn26mDJsllIS44m6krwqA",
  authDomain: "the-saki-jewels.firebaseapp.com",
  projectId: "the-saki-jewels",
  storageBucket: "the-saki-jewels.firebasestorage.app",
  messagingSenderId: "104463014307",
  appId: "1:104463014307:web:731b51810e292de1ec6216",
  measurementId: "G-F6LT3NZFER"
};

const app = initializeApp(firebaseConfig);

// 🔥 Initialize Authentication
export const auth = getAuth(app);
