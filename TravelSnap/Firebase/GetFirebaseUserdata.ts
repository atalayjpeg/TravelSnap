import { FIRESTORE_DB } from "./FireBaseConfig";
import {
  getFirestore,
  collection,
  setDoc,
  addDoc,
  doc,
  getDoc,
} from "firebase/firestore";

export const getUserDataFromFirestore = async (userId) => {
  try {
    const userDoc = await getDoc(doc(FIRESTORE_DB, "users", userId));
    if (userDoc.exists()) {
      return userDoc.data();
    } else {
      console.error("User document not found");
      return null;
    }
  } catch (error) {
    console.error("Error fetching user data from Firestore", error);
    return null;
  }
};
