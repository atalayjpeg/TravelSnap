import { FIREBASE_AUTH, FIRESTORE_DB } from "./FireBaseConfig";
import {
  getFirestore,
  collection,
  setDoc,
  addDoc,
  doc,
  serverTimestamp,
  GeoPoint,
} from "firebase/firestore";

const uploadProfilePicToFirestore = async (image, userId) => {
  const currentUserId = FIREBASE_AUTH.currentUser.uid;

  try {
    const photoData = {
      image,
      userId,
    };
    const userDocRef = doc(FIRESTORE_DB, "users", userId);
    await setDoc(userDocRef, { profilePicture: image }, { merge: true });
    await setDoc(
      doc(FIRESTORE_DB, "profilePictures", `${currentUserId}ProfilePic`),
      photoData
    );
  } catch (error) {
    console.error("Error uploading photo to Firestore", error);
  }
};

export default uploadProfilePicToFirestore;
