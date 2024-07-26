import React, { useState, useEffect, useRef } from "react";
import {
  View,
  TextInput,
  FlatList,
  Image,
  Text,
  TouchableOpacity,
  Alert,
} from "react-native";
import Header from "../Header";
import { getAllUserDataFromFirestore } from "../../../Firebase/getAllUserdataFromFirestore";
import { getFireStorePhotos } from "../../../Firebase/GetFireStorePhotos";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../Routes/TabView";
import { User } from "../../../Interface/Iuser";
import { SimpleLineIcons } from '@expo/vector-icons';
import { FIREBASE_AUTH, FIRESTORE_DB } from "../../../Firebase/FireBaseConfig";
import { arrayRemove, arrayUnion, doc, getDoc, updateDoc } from "firebase/firestore";

const SearchPage: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const [selectedUser, setSelectedUser] = useState(null);
  const [tappedUser, setTappedUser] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [userSearchResults, setUserSearchResults] = useState([]);
  const [photoSearchResults, setPhotoSearchResults] = useState([]);
  const photoSearchResultsRef = useRef([]);
  let userFollow = false;

  const handleImageClick = (item) => {
    navigation.navigate("ImageDetailView", { item });
  };

  useEffect(() => {
    if (selectedUser !== null) {
      fetchPhotosData(selectedUser, "");
    } else {
      fetchUserData(searchQuery);
      fetchPhotosData(null, searchQuery);
    }
  }, [selectedUser, searchQuery]);

  const fetchUserData = async (query) => {
    try {
      const allUsers = await getAllUserDataFromFirestore();

      if (allUsers) {
        const filteredUsers = allUsers.filter(
          (user) =>
            user.displayName &&
            user.displayName.toLowerCase().includes(query.toLowerCase())
        );

        setUserSearchResults(filteredUsers);
      } else {
        console.error("No user data found");
        setUserSearchResults([]);
      }
    } catch (error) {
      console.error("Error fetching user data", error);
      setUserSearchResults([]);
    }
  };

  const fetchPhotosData = async (userId, searchQuery) => {
    setUserSearchResults([]);
    try {
      const photosData = await getFireStorePhotos();

      let filteredPhotosData = [];

      if (userId != null) {
        // User tapped on a display name, filter by user
        filteredPhotosData = photosData.filter(
          (photo) => photo.userId === userId
        );
      } else if (searchQuery != null) {
        // User is searching by tags, filter by additionalInfo
        filteredPhotosData = photosData.filter((photo) =>
          (photo.additionalInfo as string[] | undefined)?.some(
            (info) =>
              typeof info === "string" &&
              info.toLowerCase().includes(searchQuery.toLowerCase())
          )
        );
      } else {
      }
      photoSearchResultsRef.current = filteredPhotosData;
      setPhotoSearchResults((prev) => [...prev]);
    } catch (error) {
      console.error("Error fetching photos data", error);
    }
  };

  const handleUserSelect = async (item) => {
    setTappedUser(item);
    console.log(item);
    await fetchPhotosData(item.userId, "");
  };

  const follow = async (userId) => {
    const userRef = doc(FIRESTORE_DB, "users", FIREBASE_AUTH.currentUser.uid);
    const userDoc = await getDoc(userRef);
    const otherUserRef = doc(FIRESTORE_DB, "users", userId);
    const otherUserDoc = await getDoc(otherUserRef);
    const following = userDoc.data().following.includes(userId);
    if (FIREBASE_AUTH.currentUser.uid === userId){
      return
    }
    if (following) {
      
      userFollow = false;
      await updateDoc(userRef, {
        following: arrayRemove(userId),
      });
      await updateDoc(otherUserRef,{
        followers: arrayRemove(FIREBASE_AUTH.currentUser.uid)
      });
    } else {
      userFollow = true;
    await updateDoc(userRef, {
      following: arrayUnion(userId),
    });
    await updateDoc(otherUserRef, {
      followers: arrayUnion(FIREBASE_AUTH.currentUser.uid),
    });
  }
  followAlert(userFollow);
  }

  const followAlert = (userFollow) => {
    const message = userFollow
      ? "You are now following the user"
      : "You have unfollowed the user";
  
    Alert.alert("Follow Status", message, [
      {
        text: "OK",
      },
    ]);
  };
  

  return (
    <View className="flex-1 bg-primary">
      <Header title="TravelSnap" />
      <View className="flex justify-center items-center bg-primary">
        <TextInput
          className="text-white bg-fifth border rounded-md border-secondary h-9 w-64 mt-2 p-1"
          placeholder="Search..."
          placeholderTextColor="white"
          onChangeText={(text) => {
            setSearchQuery(text);
            setUserSearchResults([]);
            setPhotoSearchResults([]);
            setSelectedUser(null);
            fetchUserData(text);
            setTappedUser(null);
          }}
        />

<View>
  {tappedUser ? (
    <>
    <View className="flex flex-row my-5 border border-tertiary p-5">
      <View>
        <Image
          style={{ width: 50, height: 50, margin: 1, marginRight: 3, borderRadius: 50 }}
          source={{ uri: tappedUser.profilePic }}
        />
      </View>
      <View className="flex flex-col">
        <Text className="text-secondary">{tappedUser.displayName}</Text>
        <Text className="text-white">{tappedUser.bio}</Text>
      </View>
      <TouchableOpacity className="mx-2"  onPress={() => follow(tappedUser.userId)}>
      <SimpleLineIcons name={"user-follow"} size={20} color="white" />
      </TouchableOpacity>
      </View>
    </>
  ) : (
    <Text></Text>
  )}
</View>

        {searchQuery !== "" && (
          <FlatList
            className="bg-primary"
            keyExtractor={(item) =>
              item.userId && item.username
                ? `${item.userId}-${item.username}`
                : item.id
            }
            data={
              userSearchResults.length > 0
                ? userSearchResults
                : photoSearchResultsRef.current
            }
            renderItem={({ item }) => {
              return (
                <View className="flex">
                  <TouchableOpacity onPress={() => handleUserSelect(item)}>
                    {item.userId && !item.id ? (
                      <Text
                        className="py-2"
                        style={{ color: "white", fontSize: 16 }}
                      >
                        {item.displayName}
                      </Text>
                    ) : null}
                  </TouchableOpacity>

                  {item.id ? (
                    <View className="flex-row justify-center items-center">
                      <TouchableOpacity onPress={() => handleImageClick(item)}>
                        <Image
                          style={{ width: 200, height: 200 }}
                          source={{ uri: item.image }}
                        />
                      </TouchableOpacity>
                    </View>
                  ) : null}
                </View>
              );
            }}
          />
        )}
      </View>
    </View>
  );
};

export default SearchPage;
