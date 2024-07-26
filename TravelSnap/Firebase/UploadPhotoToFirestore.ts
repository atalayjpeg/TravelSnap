import { FIRESTORE_DB } from "./FireBaseConfig";
import {
  getFirestore,
  collection,
  setDoc,
  addDoc,
  doc,
  serverTimestamp,
  GeoPoint,
} from "firebase/firestore";

const uploadPhotoToFirestore = async (
  userId,
  image,
  caption,
  GeoPoint,
  additionalInfo,
  likes,
  
) => {
  try {
    const photoData = {
      userId,
      image,
      caption,
      GeoPoint,
      additionalInfo,
      timestamp: serverTimestamp(),
      likes,
      
    };
    
    const docref = await addDoc(collection(FIRESTORE_DB, "photos"), photoData);
    const photoCommentsCollectionRef = collection(docref, 'comments');
    return docref
  } catch (error) {
    console.error("Error uploading photo to Firestore", error);
  }
};

export default uploadPhotoToFirestore;
