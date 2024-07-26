import React, { useEffect, useRef, useState } from "react";
import { Camera, CameraType, FlashMode } from "expo-camera";
import * as MediaLibrary from 'expo-media-library';
import { Button, Text, View, Image, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard } from "react-native";
import { Entypo } from "@expo/vector-icons";
import uploadPhotoToFirestore from "../../../Firebase/UploadPhotoToFirestore";
import { FIREBASE_AUTH, FIREBASE_STORAGE, FIRESTORE_DB } from "../../../Firebase/FireBaseConfig";
import uploadToFirestorage from "../../../Firebase/UploadToFirestorage";
import {ref} from "firebase/storage";
import { useIsFocused } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker"
import Header from "../Header";
import { arrayUnion, setDoc,doc } from "firebase/firestore";
import * as Location from 'expo-location'

const CameraPage = () => {
    const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
    const [hasMediaPermission, setHasMediaPermission] = useState<boolean | null>(null);
    const [hasLocationPermission, setHasLocationPermission] = useState<boolean | null>(null);
    const [image, setImage] = useState<string | null>(null);

    const isFocused = useIsFocused()
    const [disabled, setDisabled] = useState<boolean>(false);

    const userId = FIREBASE_AUTH.currentUser.uid;
    const [caption, setCaption] = useState<string>("");
    const [additionalInfo, setAdditionalInfo] = useState<string>("");
    const infoPlaceHolder = "";
    
    const likes = []; 

    useEffect(() => {
        (async () => {
            const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
            const mediaLibraryPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();
            const locationForegroundPermission = await Location.requestForegroundPermissionsAsync();
            setHasCameraPermission(cameraPermission.status === 'granted');
            setHasMediaPermission(mediaLibraryPermission.status === 'granted');
            setHasLocationPermission(locationForegroundPermission.status === 'granted');

        })();
    }, []);

    if(hasCameraPermission === false) {
        return <View>No Camera Access</View>
    }

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [3, 4],
            quality: 1,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri)
        }
    }

    const openCamera = async () => {
        let result = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [9, 16],
            quality: 1,
        });

        console.log(result)

        if (!result.canceled) {
            setImage(result.assets[0].uri);
        }
    }

    const splitTags = (string) => {
        return string.split(/(\s+)/).filter(function (e) {
            return e.trim().length > 0;
        });
    };

    const getCoords = async () => {
        try {
            let location = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.Highest
            });

            const { latitude, longitude } = location.coords;

            const geoLocation = `${latitude},${longitude}`;
            console.log(geoLocation);

            return geoLocation
        } catch (error) {
            console.error('error getting coordinates', error);
            throw error;
        }
    }

    const savePicture = async () => {
        if (image) {
            try {
                setDisabled(true);

                const asset = await MediaLibrary.createAssetAsync(image);
                const fileName = `image_${Date.now()}.jpg`;
                const file = { name: fileName, uri: asset.uri };
                const downloadURL = await uploadToFirestorage(file);
                const geoLocation = await getCoords();
                const tags = splitTags(additionalInfo);
                console.log(tags)
                const photoDocRef = await uploadPhotoToFirestore(userId, downloadURL, caption, geoLocation, infoPlaceHolder, likes, );

                await setDoc(photoDocRef, {
                    additionalInfo: arrayUnion(...tags),
                }, { merge: true });
                
                
                alert("Picture saved");
                setImage(null);
                setCaption("");
                setAdditionalInfo("");
                setDisabled(false);
                console.log("Picture Saved");
            } catch (error) {
                console.log(error)
            }
        }
    }

    const press = () => {
        console.log("click")
        getCoords();
    }

    if (isFocused === false) {
        return (
            <View></View>
        );
    }

    return (
        <View className="flex-1">
            <Header title={"TravelSnap"} />
        <View className="flex-1 justify-center bg-slate-900">
            {!image ?
                <View className="flex justify-between px-16">
                        <TouchableOpacity className="flex flex-row justify-between items-center my-20 p-2 border rounded-lg bg-tertiary" onPress={openCamera}>
                            <Entypo name="camera" size={42} color="white" />
                            <Text className="text-lg text-bold m-1 mx-2 text-neutral-300">Camera</Text>
                        </TouchableOpacity>

                    <TouchableOpacity className="flex flex-row justify-between items-center my-20 p-2 border rounded-lg bg-tertiary" onPress={pickImage}>
                        <Text className="text-lg text-bold m-1 mx-2 text-neutral-300">Image Gallery</Text>
                        <Entypo name="image" size={42} color="white" />
                    </TouchableOpacity>
                </View>
            :
                <KeyboardAvoidingView behavior={'padding'} className="flex-1">
                    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                        <View className="flex-1">
                            <View className="flex-row flex-start justify-between px-30 mt-2 ">
                                <TouchableOpacity className="ml-5" onPress={() => setImage(null)}>
                                    <Entypo name='cross' size={33} color="white"/>
                                </TouchableOpacity>

                                <TouchableOpacity className="mr-5" disabled={disabled} onPress={savePicture}>
                                    <Entypo style={disabled? {color: "gray"} : {color: "white"}} name='check' size={28}/>
                                </TouchableOpacity>
                            </View>

                            <View className="flex-1 items-center justify-center">
                                <View className="flex flex-row h-64 w-48 border border-rounded rounded-md">
                                    <Image className="h-full w-full rounded-md" source={{uri: image}} />
                                </View>

                                <View>
                                    <TextInput
                                        className="mt-2 p-1 bg-white h-9 w-48 border rounded-md"

                                        value={caption}
                                        
                                        onChangeText={(newValue) => setCaption(newValue)}
                                        placeholder="Caption..."
                                        placeholderTextColor="gray"
                                    />

                                    <TextInput
                                        className="mt-1 p-1 bg-white h-9 w-48 border rounded-md"

                                        value={additionalInfo}
                                        
                                        onChangeText={(newValue) => setAdditionalInfo(newValue)}
                                        placeholder="Tag..."
                                        placeholderTextColor="gray"
                                    />
                                </View>
                            </View>
                        </View>
                    </TouchableWithoutFeedback>
                </KeyboardAvoidingView>
            }
        </View>
        </View>
    )
}

export default CameraPage;