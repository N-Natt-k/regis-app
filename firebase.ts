import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDOErnZL8hmTBNkwJvFMC_w2AsskhDwdxw",
  authDomain: "web-registers.firebaseapp.com",
  projectId: "web-registers",
  storageBucket: "web-registers.firebasestorage.app",
  messagingSenderId: "986642318567",
  appId: "1:986642318567:web:fc78e36b65a5ae4b678e42",
  measurementId: "G-4TLMV8WNVS"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);