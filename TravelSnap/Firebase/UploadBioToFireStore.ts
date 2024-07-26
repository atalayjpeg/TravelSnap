import { doc, setDoc, updateDoc } from "firebase/firestore";
import { FIREBASE_AUTH, FIRESTORE_DB } from "./FireBaseConfig"

export const UploadBioToFireStore = async (bio) => {
    const currentUserId = FIREBASE_AUTH.currentUser.uid;

    try {
        const bioData = {
            bio,
        };

        await updateDoc(
            doc(FIRESTORE_DB, "users", `${currentUserId}`),
            
            bioData
        );
    } catch (error) {
        console.error("Error uploading bio to Firestore", error)
    }
};

export default UploadBioToFireStore;