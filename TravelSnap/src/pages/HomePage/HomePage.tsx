import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
  RefreshControl,
} from "react-native";
import { FIREBASE_AUTH, FIRESTORE_DB } from "../../../Firebase/FireBaseConfig";
import { styled } from "nativewind";
import getFireStorePhotos from "../../../Firebase/GetFireStorePhotos";
import { getUserDataFromFirestore } from "../../../Firebase/GetFirebaseUserdata";
import Header from "../Header";
import { useNavigation } from "@react-navigation/native";
import Routes from "../../Routes/TabView";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../Routes/TabView";
import getFireStoreProfilePics from "../../../Firebase/GetFireStoreProfilePics";
import { Octicons } from "@expo/vector-icons";
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import { FontAwesome } from "@expo/vector-icons";
import { MemoizedItemComponentProps } from "../../../Interface/ImemoizedItemComponent";

const HomePage: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const [photosData, setPhotosData] = useState(null);
  const [profilePicData, setProfilePicData] = useState(null);
  const [photoLikes, setPhotoLikes] = useState({});
  const [iconColor, setIconColor] = useState({});
  const [refreshing, setRefreshing] = useState(false);
  const [followingList, setFollowingList] = useState([]);
  const [filterActive, setFilterActive] = useState(false);

  const MemoizedItemComponent: React.FC<MemoizedItemComponentProps> = ({
    item,
    onPress,
    onLikeClick,
  }) => {
    return (
      <TouchableOpacity
        onPress={() => onPress(item)}
        className="border-y-2 border-fifth"
      >
        <View>
          <View
            className="my-2"
            style={{ flexDirection: "row", alignItems: "center" }}
          >
            {profilePicData &&
              profilePicData.find(
                (profile) => profile.userId === item.userId
              ) && (
                <Image
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 25,
                    marginRight: 10,
                  }}
                  source={{
                    uri: profilePicData.find(
                      (profile) => profile.userId === item.userId
                    ).image,
                  }}
                />
              )}
            <Text className="font-bold text-tertiary mx-2 text-lg">
              {item.displayName}
            </Text>
          </View>
          <View className="items-center mb-3 ml-1">
            <Image
              style={{ width: 500, height: 500, marginBottom: 1 }}
              source={{ uri: item.image }}
            />
          </View>
          <View className="flex flex-col">
            <View className="flex flex-row">
              <TouchableOpacity
                className="mx-1"
                onPress={() => onLikeClick(item)}
              >
                <Octicons
                  name="heart-fill"
                  size={24}
                  color={iconColor[item.id]}
                />
              </TouchableOpacity>
              <Text className="mx-2 text-neutral-300">
                {photoLikes[item.id]}
              </Text>
            </View>
            <View className="flex flex-row m-1 mx-1">
              {item.caption && (
                <Text className="text-base font-bold text-neutral-300 mx-1">
                  {item.displayName}:
                </Text>
              )}
              <Text className="text-base text-neutral-300">{item.caption}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };
  const fetchFollowingList = async () => {
    try {
      const userData = await getUserDataFromFirestore(
        FIREBASE_AUTH.currentUser.uid
      );
      setFollowingList(userData.following || []);
    } catch (error) {
      console.error("Error fetching following list", error);
    }
  };
  const fetchData = async () => {
    try {
      const photosData = await getFireStorePhotos();
      let filteredPhotosData = photosData.filter(
        (photo) => photo.userId !== FIREBASE_AUTH.currentUser.uid
      );

      if (filterActive) {
        filteredPhotosData = filteredPhotosData.filter((photo) =>
          followingList.includes(photo.userId)
        );
      }

      const usersPromises = filteredPhotosData.map(async (photo) => {
        const userData = await getUserDataFromFirestore(photo.userId);
        return { ...photo, displayName: userData.displayName };
      });

      const photosWithUsername = await Promise.all(usersPromises);

      setPhotosData(photosWithUsername);

      const profilePicData = await getFireStoreProfilePics();
      setProfilePicData(profilePicData);
    } catch (error) {
      console.error("Error fetching data", error);
    }
  };
  useEffect(() => {
   
    fetchFollowingList();
    fetchData();
  }, [filterActive]);

  useEffect(() => {
    if (photosData && photosData.length > 0) {
      photosData.forEach((item) => {
        checkUserLike(item);
      });
    }
  }, [photosData]);

  useEffect(() => {}, [photoLikes]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);

    try {
      const refreshedPhotosData = await getFireStorePhotos();

      let filteredPhotosData = refreshedPhotosData.filter(
        (photo) => photo.userId !== FIREBASE_AUTH.currentUser.uid
      );

      if (filterActive) {
        filteredPhotosData = filteredPhotosData.filter((photo) =>
          followingList.includes(photo.userId)
        );
      }
      

      const usersPromises = filteredPhotosData.map(async (photo) => {
        const userData = await getUserDataFromFirestore(photo.userId);
        return { ...photo, displayName: userData.displayName };
      });
      const photosWithUsername = await Promise.all(usersPromises);
      setPhotosData(photosWithUsername);
    } catch (error) {
      console.error("Error refreshing data", error);
    } finally {
      setRefreshing(false);
    }
  }, []);

  const handleImageClick = (item) => {
    navigation.navigate("ImageDetailView", { item });
  };

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

  return (
    <View className="flex-1 bg-primary">
      <Header title="TravelSnap" />
      <TouchableOpacity onPress={() => setFilterActive(!filterActive)}>
        <FontAwesome
          name="users"
          size={24}
          color={filterActive ? "coral" : "white"}
        />
      </TouchableOpacity>
      <FlatList
        data={photosData}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <MemoizedItemComponent
            item={item}
            onPress={handleImageClick}
            onLikeClick={handleLikeClick}
          />
        )}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["coral"]}
          />
        }
      />
    </View>
  );
};

export default HomePage;
