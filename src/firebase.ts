import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyB9K3tt2Pkai4QDxLRsYM85vm6AFl3qeCY",
  authDomain: "dz-shopper.firebaseapp.com",
  projectId: "dz-shopper",
  storageBucket: "dz-shopper.firebasestorage.app",
  messagingSenderId: "8968313948",
  appId: "1:8968313948:web:4c3903db059ed0e722da99"
};

// تهيئة تطبيق Firebase
const app = initializeApp(firebaseConfig);

// تجهيز خدمات المصادقة (للمستخدمين) وقاعدة البيانات (للطلبات)
export const auth = getAuth(app);
export const db = getFirestore(app);