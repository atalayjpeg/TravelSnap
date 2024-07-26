import React from "react";
import { useEffect, useState } from "react";
import {
  View,
  Text,
  Button,
  FlatList,
  Image,
  ScrollView,
  TouchableOpacity,
  Linking,
  Platform,
  Alert,
  RefreshControl,
} from "react-native";
import Header from "../Header";
import { getStorage, ref, deleteObject } from "@firebase/storage";
import {
  getFirestore,
  collection,
  doc,
  deleteDoc,
  addDoc,
  serverTimestamp,
  getDocs,
  orderBy,
} from "@firebase/firestore";
import {
  FIREBASE_STORAGE,
  FIRESTORE_DB,
} from "../../../Firebase/FireBaseConfig";
import { FIREBASE_AUTH } from "../../../Firebase/FireBaseConfig";
import { Feather } from "@expo/vector-icons";
import { EvilIcons } from "@expo/vector-icons";
import { Octicons } from "@expo/vector-icons";
import {
  setDoc,
  getDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  query,
} from "firebase/firestore";
import { useNavigation } from "@react-navigation/native";
import { AntDesign } from "@expo/vector-icons";
import { TextInput } from "react-native-gesture-handler";
import { Use } from "react-native-svg";
import { getUserDataFromFirestore } from "../../../Firebase/GetFirebaseUserdata";
import {Comment} from "../../../Interface/IComment";

const ImageDetailView = (props) => {
  const { item } = props.route.params;
  const formattedTimestamp = item.timestamp.toLocaleString();
  const [photoLikes, setPhotoLikes] = useState({});
  const [iconColor, setIconColor] = useState({});
  const [photosData, setPhotosData] = useState(null);
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState<Comment[]>([]);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const user = FIREBASE_AUTH.currentUser;
        if (user) {
          const userData = await getUserDataFromFirestore(user.uid);
          setUserData(userData);
        }
      } catch (error) {
        console.error("Error fetching user data", error);
      }
    };
    fetchUserData();
  }, []);

  const isCommentOwner = (commentUserId) => {
    return FIREBASE_AUTH.currentUser.uid === commentUserId;
  };

  const handleDeleteComment = async (commentId) => {
    const commentRef = doc(FIRESTORE_DB, "photos", item.id, "comments", commentId);
  
    try {
      await deleteDoc(commentRef);
      console.log("Comment deleted successfully");
      fetchComments();
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  };

  const handleCommentChange = (text) => {
    setComment(text);
  };

  const handleAddComment = async () => {
    if (!comment.trim()) {
      return;
    }

    const commentsRef = collection(FIRESTORE_DB, "photos", item.id, "comments");
    try {
      await addDoc(commentsRef, {
        userId: FIREBASE_AUTH.currentUser.uid,
        text: comment,
        timestamp: serverTimestamp(),
        displayName: userData.displayName,
      });

      setComment("");
      fetchComments();
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };
  useEffect(() => {
    if (photosData && photosData.length > 0) {
      photosData.forEach((item) => {
        checkUserLike(item);
      });
    }
  }, [photosData]);
  const fetchComments = async () => {
    const commentsRef = collection(
      FIRESTORE_DB,
      "photos",
      item.id,
      "comments"
    );
    const commentsQuery = query(commentsRef, orderBy("timestamp", "asc"));

    try {
      const querySnapshot = await getDocs(commentsQuery);
      const fetchedComments = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        userId: doc.data().userId,
        text: doc.data().text,
        timestamp: doc.data().timestamp,
        displayName: doc.data().displayName,
      }));
      setComments(fetchedComments);
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  };
  useEffect(() => {
    

    fetchComments();
  }, [item.id]);

  useEffect(() => {}, [photoLikes]);

  const checkUserLike = async (photo) => {
    const photoRef = doc(FIRESTORE_DB, "photos", photo.id);
    const photoDoc = await getDoc(photoRef);

    if (photoDoc.exists()) {
      const likedByUser = photoDoc
        .data()
        .likes.includes(FIREBASE_AUTH.currentUser.uid);
      setIconColor((prevColors) => ({
        ...prevColors,
        [photo.id]: likedByUser ? "coral" : "white",
      }));
      setPhotoLikes((prevLikes) => ({
        ...prevLikes,
        [photo.id]: photoDoc.data().likes.length,
      }));
    } else {
      console.error("Photo not found in the database");
    }
  };

  const handleLikeClick = async (item) => {
    const photoRef = doc(FIRESTORE_DB, "photos", item.id);
    const photoDoc = await getDoc(photoRef);

    if (!photoDoc.exists()) {
      console.error("Photo not found in the database");
      return;
    }

    const likedByUser = photoDoc
      .data()
      .likes.includes(FIREBASE_AUTH.currentUser.uid);

    if (likedByUser) {
      // Unlike
      await updateDoc(photoRef, {
        likes: arrayRemove(FIREBASE_AUTH.currentUser.uid),
      });
      setIconColor((prevColors) => ({
        ...prevColors,
        [item.id]: "white", // Change the color when unliked
      }));
      setPhotoLikes((prevLikes) => ({
        ...prevLikes,
        [item.id]: prevLikes[item.id] - 1,
      }));
    } else {
      // Like
      await updateDoc(photoRef, {
        likes: arrayUnion(FIREBASE_AUTH.currentUser.uid),
      });
      setIconColor((prevColors) => ({
        ...prevColors,
        [item.id]: "coral", // Change the color when liked
      }));
      setPhotoLikes((prevLikes) => ({
        ...prevLikes,
        [item.id]: prevLikes[item.id] + 1,
      }));
    }
  };

  const openInMaps = () => {
    const scheme = Platform.select({
      ios: "maps://0,0?q=",
      android: "geo:0,0?q=",
    });
    const label = "Traveled";
    const latLong = item.GeoPoint;
    const url = Platform.select({
      ios: `${scheme}${label}@${latLong}`,
      android: `${scheme}${latLong}(${label})`,
    });

    Linking.openURL(url);
    console.log(url);
  };

  const handleDelete = async () => {
    try {
      const imageRef = ref(FIREBASE_STORAGE, item.image);
      await deleteObject(imageRef);
      const docRef = doc(FIRESTORE_DB, "photos", item.id);
      await deleteDoc(docRef);
      console.log("Image and document deleted successfully");
      props.navigation.goBack();
    } catch (error) {
      console.error("Error deleting image and document:", error);
    }
  };

  const navigation = useNavigation();

  const deleteAlert = () => {
    Alert.alert("Delete Post", "Do you want to delete this post?", [
      {
        text: "Cancel",
        onPress: () => console.log("Cancel Pressed"),
        style: "cancel",
      },
      {
        text: "OK",
        onPress: () => handleDelete(),
      },
    ]);
  };

  return (
    <View className="flex flex-1 bg-fifth">
      <Header title="TravelSnap" />
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={{ position: "absolute", marginTop: 52, left: 16 }}
      >
        <AntDesign name="stepbackward" size={24} color="#0C4F69" />
      </TouchableOpacity>

      <ScrollView>
        <View>
          <Text className="font-bold text-tertiary text-lg m-1 mt-5">
            {item.displayName}
          </Text>
        </View>

        <View className="items-center mb-3 ml-1">
          <Image
            style={{ width: 500, height: 500, marginBottom: 1 }}
            source={{ uri: item.image }}
          />
        </View>

        <View>
          <TouchableOpacity
            className="mx-1"
            onPress={(focused) => handleLikeClick(item)}
          >
            <Octicons name="heart-fill" size={24} color={iconColor[item.id]} />
          </TouchableOpacity>
          <View className="m-3">
            <Text className="text-white text-right">
              Date: {formattedTimestamp}
            </Text>
            <Text className="text-white">{item.caption}</Text>
            <Text className="text-white">{item.additionalInfo}</Text>
          </View>
          <View className="Flex flex-col mx-1">
            {comments.map((commentItem) => (
              <View className="Flex flex-row ml-3" key={commentItem.id}>
              <Text className="text-white text-bold">
                {commentItem.displayName}:
              </Text>
              <Text className="text-white">{commentItem.text}</Text>
              {isCommentOwner(commentItem.userId) && (
                <TouchableOpacity onPress={() => handleDeleteComment(commentItem.id)}>
                  <EvilIcons name="trash" size={20} color="red" />
                </TouchableOpacity>
              )}
            </View>
            ))}
            <View className="flex flex-row">
              <TextInput
                className="text-white bg-fifth border border-secondary rounded-md  m-1"
                value={comment}
                style={{ width: "80%" }}
                onChangeText={handleCommentChange}
                placeholder="Type your comment..."
              />
              <TouchableOpacity onPress={handleAddComment}>
                <AntDesign name="caretup" size={25} color="#0C4F69" />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            className="bg-fifth rounded p-1 m-1 "
            style={{ width: "32%" }}
            onPress={openInMaps}
          >
            <Text className="text-white ">
              <Feather name="map-pin" size={24} color="white" />
            </Text>
          </TouchableOpacity>

          {FIREBASE_AUTH.currentUser.uid === item.userId && (
            <TouchableOpacity
              className=" p-3 m-2 mx-0.5 "
              onPress={deleteAlert}
            >
              <Text style={{ color: "red", fontSize: 15 }}>
                <EvilIcons name="trash" size={25} color="red" />
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default ImageDetailView;
