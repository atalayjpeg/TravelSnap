import { getDoc, collection, getDocs, Firestore } from "firebase/firestore";
import { FIRESTORE_DB } from "./FireBaseConfig";

interface PhotoData {
        id: string;
        GeoPoint: string;
        additionalInfo: [];
        caption: string;
        image: string;
        likes: [];
        timestamp: Date;
        userId: string;
        
};

export const getFireStorePhotos = async (): Promise<PhotoData[] | null> => {
  try {
    const photosCollection = collection(FIRESTORE_DB, "photos");
    const querySnapshot = await getDocs(photosCollection);

    const photosData: PhotoData[] = [];

    querySnapshot.forEach((doc) => {
      if (doc.exists()) {
        const photo: PhotoData = {
            id: doc.id,
            GeoPoint: doc.data().GeoPoint || '', 
            additionalInfo: doc.data().additionalInfo || [],
            caption: doc.data().caption || '', 
            image: doc.data().image || '',
            likes: doc.data().likes || [],
            timestamp: doc.data().timestamp.toDate(), 
            userId: doc.data().userId || '',
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

export default getFireStorePhotos;
