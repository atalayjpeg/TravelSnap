import { getDoc, collection, getDocs, Firestore } from "firebase/firestore";
import { FIRESTORE_DB } from "./FireBaseConfig";

interface PhotoData {
  id: string;
  image: string;
  userId: string;
}

export const getFireStoreProfilePics = async (): Promise<
  PhotoData[] | null
> => {
  try {
    const photosCollection = collection(FIRESTORE_DB, "profilePictures");
    const querySnapshot = await getDocs(photosCollection);

    const photosData: PhotoData[] = [];

    querySnapshot.forEach((doc) => {
      if (doc.exists()) {
        const photo: PhotoData = {
          id: doc.id,
          image: doc.data().image || "",
          userId: doc.data().userId || "",
        };
        photosData.push(photo);
      } else {
        console.error("Photo document not found");
      }
    });

    return photosData;
  } catch (error) {
    console.error("Error fetching photos data from Firestore", error);
    return null;
  }
};

export default getFireStoreProfilePics;
