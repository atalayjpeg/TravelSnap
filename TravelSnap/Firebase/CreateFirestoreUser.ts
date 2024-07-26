import { FIRESTORE_DB } from "./FireBaseConfig";
import {
  getFirestore,
  collection,
  setDoc,
  addDoc,
  doc,
} from "firebase/firestore";
import uploadProfilePicToFirestore from "./UploadProfilePicToFireStore";

const CreateFirestoreUser = async (userId, email, displayName) => {
  const uploadProfilePic = async (userId) => {
    try {
      const filePath = "https://firebasestorage.googleapis.com/v0/b/travelsnap-92996.appspot.com/o/profileImages%2Fimage_1702610758842.jpg?alt=media&token=65ef82aa-b128-4232-95b8-1a3b38deec1a"

      uploadProfilePicToFirestore(filePath, userId);
    } catch (error) {
      console.log(error)
    }
  }
  const followers = [];
  const following = [];
  const profilePicture = "";
  const likes = [];
  const bio = "";
  try {
    await setDoc(doc(FIRESTORE_DB, "users", userId), {
      userId,
      email,
      displayName,
      followers,
      following,
      profilePicture,
      likes,
      bio
    });

    uploadProfilePic(userId)
  } catch (error) {
    console.error("Error creating user in Firestore", error);
  }
};

export default CreateFirestoreUser;
