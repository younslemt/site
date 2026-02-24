import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDV2NEJJhMeUcyAibp972Iz279O0f1yt4s",
  authDomain: "sprint-master-57675.firebaseapp.com",
  projectId: "sprint-master-57675",
  storageBucket: "sprint-master-57675.firebasestorage.app",
  messagingSenderId: "653613311116",
  appId: "1:653613311116:web:079f2a806273cba5cd07a9",
  measurementId: "G-8J1JB783C9"
};

const app = initializeApp(firebaseConfig);

// Initialize Analytics
let analytics = null;
isSupported().then(yes => {
  if (yes) {
    analytics = getAnalytics(app);
  }
});

export { analytics };
export const auth = getAuth(app);
export const db = getFirestore(app);
