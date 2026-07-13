// firebase.ts
import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getFirestore } from "firebase/firestore";
const firebaseConfig = {
  apiKey: "AIzaSyDbqRHcS5xozE26ANS5RxYGjnQMlwwb8gM",
  authDomain: "asaad-dobae.firebaseapp.com",
  databaseURL: "https://asaad-dobae-default-rtdb.firebaseio.com",
  projectId: "asaad-dobae",
  storageBucket: "asaad-dobae.firebasestorage.app",
  messagingSenderId: "879581253100",
  appId: "1:879581253100:web:7b793aeb3cd11c593e04c9",
  measurementId: "G-GMX3ZBRL5R"
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const database = getDatabase(app);

export { auth, db, database };
