import { FIRESTORE_DB } from "./FireBaseConfig";
import {
  getFirestore,
  collection,
  setDoc,
  addDoc,
  doc,
  getDoc,
  getDocs,
} from "firebase/firestore";

export const getAllUserDataFromFirestore = async () => {
  try {
    const usersCollection = collection(FIRESTORE_DB, "users");
    const usersSnapshot = await getDocs(usersCollection);

    const allUsers = usersSnapshot.docs.map((doc) => {
      const userData = doc.data();
      return {
        userId: doc.id, 
        displayName: userData.displayName,
        bio: userData.bio,
        profilePic: userData.profilePicture,
      };
    });

    return allUsers;
  } catch (error) {
    console.error("Error fetching all user data from Firestore", error);
    throw error;
  }
};
