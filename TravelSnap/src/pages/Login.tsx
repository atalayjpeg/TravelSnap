import {
  Text,
  View,
  TextInput,
  Button,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import React, { useState, useEffect } from "react";
import { FIREBASE_AUTH } from "../../Firebase/FireBaseConfig";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  setPersistence,
  browserSessionPersistence,
} from "firebase/auth";
import CreateFirestoreUser from "../../Firebase/CreateFirestoreUser";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Header from "./Header";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [showUsernameInput, setShowUsernameInput] = useState(false);
  const [showCreateAccountButton, setShowCreateAccountButton] = useState(false);
  const [showRegistration, setShowRegistration] = useState(true);
  const auth = FIREBASE_AUTH;

  const signIn = async () => {
    setLoading(true);
    try {
      const response = await signInWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );
      console.log(response);
      await AsyncStorage.setItem("uPassword", password);
      await AsyncStorage.setItem("uEmail", email.trim());
    } catch (error) {
      console.log(error);
      alert("sign in failed" + error.message);
    } finally {
      setLoading(false);
    }
  };

  const signUp = async () => {
    setLoading(true);
    try {
      const response = await createUserWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );
      console.log(response);
      await AsyncStorage.setItem("uPassword", password);
      await AsyncStorage.setItem("uEmail", email.trim());
    } catch (error) {
      console.log(error);
      alert("sign up failed" + error.message);
    } finally {
      setLoading(false);
      CreateFirestoreUser(auth.currentUser.uid, email, displayName);
    }
  };

  useEffect(() => {
    const checkStoredCredentials = async () => {
      const storedEmail = await AsyncStorage.getItem("uEmail");
      const storedPassword = await AsyncStorage.getItem("uPassword");

      if (storedEmail !== undefined && storedPassword !== undefined) {
        setLoading(true);
        setEmail(storedEmail);
        setPassword(storedPassword);
        try {
          await signInWithEmailAndPassword(auth, storedEmail, storedPassword);
        } finally {
          setLoading(false);
        }
      }
    };

    checkStoredCredentials();
  }, []);

  const toggleUsernameInput = () => {
    setShowUsernameInput(!showUsernameInput);
    setShowCreateAccountButton(true);
    setShowRegistration(false);
  };

  return (
    <View className ="bg-fifth"style={styles.container}>
      <Header title="TravelSnap" />
      {showUsernameInput && (
        <TextInput
          className="p-2 border m-1 border-secondary text-white mx-7"
          placeholderTextColor="gray"
          value={displayName}
          placeholder="Display name"
          onChangeText={(text) => setDisplayName(text)
          }
        />
      )}
      <TextInput 
        className="p-2 border m-1 border-secondary text-white mx-7"
        placeholderTextColor="gray"
        value={email}
        placeholder="Email"
        autoCapitalize="none"
        onChangeText={(text) => setEmail(text)}
      ></TextInput>
      <TextInput
      className="p-2 border m-1 border-secondary text-white mx-7"
        placeholderTextColor="gray"
        secureTextEntry={true}
        value={password}
        placeholder="password"
        onChangeText={(text) => setPassword(text)}
      ></TextInput>

      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <>
        <TouchableOpacity onPress={signIn} className='border-2 border-secondary bg-primary rounded p-2 m-2 mx-7'>
          <View className='p-2'>
            <Text className='text-white text-center'>Login</Text>
          </View>
        </TouchableOpacity>
          {showCreateAccountButton && (
            <TouchableOpacity onPress={signUp} className='border-2 border-secondary bg-primary rounded p-2 m-2 mx-7'>
      <View className='p-2'>
        <Text className='text-white text-center'>Create account</Text>
      </View>
    </TouchableOpacity>
          )}
          {showRegistration && (
            <TouchableOpacity onPress={toggleUsernameInput} className='border-2 border-secondary bg-primary rounded p-2 m-2 mx-7'>
            <View className='p-2'>
              <Text className='text-white text-center'>Register</Text>
            </View>
          </TouchableOpacity>
          )}
        </>
      )}
    </View>
  );
};

export default Login;

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 0,
    flex: 1,
    justifyContent: "center",
  },
});
