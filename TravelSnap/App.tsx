import React from 'react';
import { useState, useEffect } from 'react';
import {NavigationContainer} from '@react-navigation/native';
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import {StyleSheet, Text, View } from 'react-native';
import Login from './src/pages/Login';
import TabView from "./src/Routes/TabView";
import { FIREBASE_AUTH } from './Firebase/FireBaseConfig';
import Header from './src/pages/Header';
import ImageDetailView from './src/pages/ImageDetailView/ImageDetailView';

const Stack = createNativeStackNavigator();

export default function App() {
  const [authenticated, setAuthenticated] = useState(false);
  


  useEffect(() => {
    const unsubscribe = FIREBASE_AUTH.onAuthStateChanged((user) => {
      // If the user is authenticated, update the state
      if (user) {
        setAuthenticated(true);
      } else {
        setAuthenticated(false);
      }
    });

    // Clean up the subscription when the component unmounts
    return () => unsubscribe();
  }, []);

  return (
    <NavigationContainer>
    <Stack.Navigator>
      {authenticated ? (
        <Stack.Screen
          name="TabView"
          component={TabView}
          options={{ headerShown: false }}
        />
      ) : (
        <Stack.Screen
          name="Login"
          component={Login}
          options={{ headerShown: false }}
        />
      )}
    </Stack.Navigator>
  </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
