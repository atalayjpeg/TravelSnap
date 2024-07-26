import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import AsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
  apiKey: "AIzaSyA1Sh_yVDjb1nVujK4BTPU-Pm2qBbWpOtA",
  authDomain: "travelsnap-92996.firebaseapp.com",
  projectId: "travelsnap-92996",
  storageBucket: "travelsnap-92996.appspot.com",
  messagingSenderId: "383929518419",
  appId: "1:383929518419:web:3e9347bdbdbbf21a13f9a6",
};
export const logout = async () => {
  try {
    await AsyncStorage.removeItem("uEmail");
    await AsyncStorage.removeItem("uPassword");
    await FIREBASE_AUTH.signOut();
    console.log("User logged out successfully");
  } catch (error) {
    console.error("Error logging out:", error);
  }
};

export const FIREBASE_APP = initializeApp(firebaseConfig);
export const FIREBASE_AUTH = getAuth(FIREBASE_APP);
export const FIRESTORE_DB = getFirestore(FIREBASE_APP);
export const FIREBASE_STORAGE = getStorage(FIREBASE_APP);
