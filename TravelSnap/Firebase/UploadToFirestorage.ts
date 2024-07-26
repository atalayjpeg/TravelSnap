import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";
import { FIREBASE_STORAGE } from "./FireBaseConfig";

export const uploadToFirestorage = async (file) => {
  const response = await fetch(file.uri);
  const blob = await response.blob();
  const storageRef = ref(FIREBASE_STORAGE, "images/" + file.name);
  const uploadTask = uploadBytesResumable(storageRef, blob);
  uploadTask.on("state_changed", (snapshot) => {
    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
    console.log("progress: " + progress + "%");
  });
  await uploadTask;
  const downloadURL = await getDownloadURL(storageRef);

  return downloadURL;
};

export default uploadToFirestorage;
