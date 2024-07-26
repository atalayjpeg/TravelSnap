import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Keyboard,
  TextInput,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../Routes/TabView";
import { FIREBASE_AUTH } from "../../../Firebase/FireBaseConfig";
import { getUserDataFromFirestore } from "../../../Firebase/GetFirebaseUserdata";
import { logout } from "../../../Firebase/FireBaseConfig";
import getFireStorePhotos from "../../../Firebase/GetFireStorePhotos";
import Header from "../Header";
import * as ImagePicker from "expo-image-picker";
import * as MediaLibrary from "expo-media-library";
import uploadProfilePicToFireStorage from "../../../Firebase/UploadProfilePicToFireStorage";
import uploadProfilePicToFirestore from "../../../Firebase/UploadProfilePicToFireStore";
import getFireStoreProfilePics from "../../../Firebase/GetFireStoreProfilePics";
import { useIsFocused } from "@react-navigation/native";
import { BottomSheet, BottomSheetRef } from 'react-native-sheet';
import { TouchableWithoutFeedback } from "react-native-gesture-handler";
import UploadBioToFireStore from "../../../Firebase/UploadBioToFireStore";

const ProfilePage: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const [userData, setUserData] = useState(null);
  const [photosData, setPhotosData] = useState(null);
  const [profilePicData, setProfilePicData] = useState(null);
  const [addProfilePic, setAddProfilePic] = useState<string | null>(null);
  const [newBio, setNewBio] = useState<string>("");
  const bottomSheet = useRef<BottomSheetRef>(null);
  const [refreshing, setRefreshing] = useState(false);

  let saveBtnTL = "flex items-center border bg-tertiary rounded-full mb-1 p-1";
  let saveBtnTLLocked = "flex items-center border bg-secondary rounded-full mb-1 p-1";

  const userId = FIREBASE_AUTH.currentUser.uid;
  const isFocused = useIsFocused();
  const [disabled, setDisabled] = useState(false);
  const [saveBtnColor, setSaveBtnColor] = useState<string>(saveBtnTL);

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

    const fetchPhotosData = async () => {
      try {
        const photosData = await getFireStorePhotos();
        const filteredPhotosData = photosData.filter(
          (photo) => photo.userId === FIREBASE_AUTH.currentUser.uid
        );
        setPhotosData(filteredPhotosData);
        
      } catch (error) {
        console.error("Error fetching photos data", error);
      }
    };

    const fetchProfilePictureData = async () => {
      try {
        const profilePicData = await getFireStoreProfilePics();
        const filteredProfilePicData = profilePicData.filter(
          (photo) => photo.userId === FIREBASE_AUTH.currentUser.uid
        );
        setProfilePicData(filteredProfilePicData);
      } catch (error) {
        console.error("Error fetching profile picture data", error);
      }
    };

    fetchPhotosData();
    fetchUserData();
    fetchProfilePictureData();
  }, [isFocused]);

  const onRefreshBio = useCallback(async () => {
    setRefreshing(true);

    try {
      const user = FIREBASE_AUTH.currentUser;
      if (user) {
        const userData = await getUserDataFromFirestore(user.uid);
        setUserData(userData);
      }
    } catch (error) {
      console.error("Error fetching user data", error);
    } finally {
      setRefreshing(false);
    }
  }, []);

  const onRefreshProfilePic = useCallback(async () => {
    setRefreshing(true);

    try {
      const profilePicData = await getFireStoreProfilePics();
        const filteredProfilePicData = profilePicData.filter(
          (photo) => photo.userId === FIREBASE_AUTH.currentUser.uid
        );
        setProfilePicData(filteredProfilePicData);
    } catch (error) {
      console.error("Error fetching user data", error);
    } finally {
      setRefreshing(false);
    }
  }, []);

  const pickProfilePic = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setAddProfilePic(result.assets[0].uri);
    }
  };

  const saveProfilePic = async () => {
    if (addProfilePic) {
      try {
        setDisabled(true);
        setSaveBtnColor(saveBtnTLLocked);
        const asset = await MediaLibrary.createAssetAsync(addProfilePic);
        const fileName = `image_${Date.now()}.jpg`;
        const file = { name: fileName, uri: asset.uri };
        const downloadURL = await uploadProfilePicToFireStorage(file);

        uploadProfilePicToFirestore(downloadURL, userId);
        alert("Profile Picture Uploaded");
        setAddProfilePic(null);
        console.log("Profile Picture Saved");
        setDisabled(false);
        setSaveBtnColor(saveBtnTL);
        onRefreshProfilePic();
      } catch (error) {
        console.log(error);
      }
    }
  };

  const editBio = async () => {
    try {
      UploadBioToFireStore(newBio,);
      bottomSheet.current.hide()
      setNewBio("");
      onRefreshBio();
    } catch (error) {
      console.log(error);
    }
  }

  const handleImageClick = (item) => {
    navigation.navigate("ImageDetailView", { item });
  };

  const handleLogout = async () => {
    await logout();
  };

  if (isFocused === false) {
    return <View></View>;
  }


  const photosCount = photosData?.length ?? 0;
  const followers = userData?.followers.length ?? 0;
  const following = userData?.following.length ?? 0;
  return (
    <View className="flex-1 bg-slate-900">
      <Header title="TravelSnap" />
      <View className="bg-slate-900 border-y-8 border-slate-950">
          <View className="flex-row shadow-sm pl-4">
            <View className="flex flex-col">
            {profilePicData &&
              profilePicData.map((item) => (
                <Image
                  style={{ width: 110, height: 110, margin: 10, borderRadius: 50 }}
                  source={{ uri: item.image }}
                />
              ))}
              
              <View className="flex flex-row justify-center items-center">
                <View className="mx-2 flex justify-center items-center">
              <Text className="text-white text-s justify-center item-center">{photosCount}</Text>
              <Text className="text-white text-xs">posts</Text>
              </View>
              <View className="flex justify-center items-center">
              <Text className="text-white ">{followers}</Text>
              <Text className="text-white text-xs">Followers</Text>
              </View>
              <View className="flex justify-center items-center m-1">
              <Text className="text-white ">{following}</Text>
              <Text className="text-white text-xs">Following</Text>
              </View>
              
              </View>
              </View>
              
            <View className="mt-4 mr-4 mb-2 flex-1">
            {userData && (
              <View>
                <Text className="text-neutral-300 m-1 font-bold ">
                  {userData.displayName}
                </Text>

                <Text className="text-neutral-300 m-1 flex-wrap">
                {userData.bio}
                </Text>
              </View>
            )}
          </View>

            
          </View>
          
          <View className="flex-row justify-end mb-2 mr-5">

              <TouchableOpacity className="flex items-center border bg-tertiary rounded-full mb-1 mr-1 p-1" onPress={() => bottomSheet.current?.show()}>
                <Text className="m-1">Edit Bio</Text>
              </TouchableOpacity>
            
              {!addProfilePic ? (
                <TouchableOpacity
                  className="flex items-center border bg-tertiary rounded-full mb-1 p-1"
                  onPress={pickProfilePic}
                >
                  <Text className="m-1">Edit Picture</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  className={`${saveBtnColor}`}
                  disabled={disabled}
                  onPress={saveProfilePic}
                >
                  <Text className="m-1">Save</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                className="flex items-center border bg-tertiary rounded-full mb-1 p-1 ml-1"
                onPress={handleLogout}
              >
                <Text className="m-1">Log out</Text>
              </TouchableOpacity>
            </View>

              <BottomSheet backdropBackgroundColor={"#0f172a"} sheetBackgroundColor={"#0f172a"}  height={600} ref={bottomSheet}>
                <KeyboardAvoidingView behavior={'padding'} className="flex p-2">
                  <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View className="">
                      {userData && (
                      <TextInput
                        className="text-white border-primary"
                        style={{ textAlignVertical: 'top', borderWidth: 1, height: 200, borderRadius: 3 }}
                        multiline={true}
                        value={newBio}
                        onChangeText={(newValue) => setNewBio(newValue)}
                      />      
                      )}

                      <TouchableOpacity className="items-center border-2 border-secondary bg-primary rounded p-2 m-2 mx-7" onPress={editBio}>
                        <Text className="text-white">Save</Text>
                      </TouchableOpacity>
                    </View>
                  </TouchableWithoutFeedback>
                </KeyboardAvoidingView>
              </BottomSheet>

          </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          flexDirection: "row",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {photosData &&
          photosData
            .sort((a, b) =>
              b.timestamp.toLocaleString() > a.timestamp.toLocaleString()
                ? 1
                : -1
            )
            .map((item) => (
              <TouchableOpacity 
              onPress={() => handleImageClick(item)} 
              key={item.id}
              className="h-24 w-24 items-center border border-fifth m-1"
            >
              <Image
                className="h-full w-full"
                source={{ uri: item.image }}
              />
            </TouchableOpacity>
            ))}
      </ScrollView>
    </View>
  );
};

export default ProfilePage;
