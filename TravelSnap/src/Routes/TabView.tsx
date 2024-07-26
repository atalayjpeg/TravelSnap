import {
  BottomTabNavigationOptions,
  createBottomTabNavigator,
} from "@react-navigation/bottom-tabs";
import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import HomePage from "../pages/HomePage/HomePage";
import SearchPage from "../pages/SearchPage/SearchPage";
import ProfilePage from "../pages/ProfilePage/ProfilePage";
import CameraPage from "../pages/CameraPage/CameraPage";
import ImageDetailView from "../pages/ImageDetailView/ImageDetailView";
import { Entypo } from "@expo/vector-icons";
import { MaterialIcons } from "@expo/vector-icons";
import { Ionicons } from "@expo/vector-icons";
import { Text, TextStyle } from "react-native";

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const HomeStack = () => (
  <Stack.Navigator>
    <Stack.Screen
      name="HomeView"
      component={HomePage}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="ImageDetailView"
      component={ImageDetailView}
      options={{ headerShown: false }}
    />
  </Stack.Navigator>
);

const ProfileStack = () => (
  <Stack.Navigator>
    <Stack.Screen
      name="profileView"
      component={ProfilePage}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="ImageDetailView"
      component={ImageDetailView}
      options={{ headerShown: false }}
    />
  </Stack.Navigator>
);

const SearchStack = () => (
  <Stack.Navigator>
    <Stack.Screen
      name="SearchView"
      component={SearchPage}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="ImageDetailView"
      component={ImageDetailView}
      options={{ headerShown: false }}
    />
  </Stack.Navigator>
);


const Routes: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: "#020617" },
      }}
      initialRouteName="HomePage"
    >
      <Tab.Screen
        name="Home"
        component={HomeStack}
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <MaterialIcons
              name="home-filled"
              size={24}
              color={focused ? "coral" : "white"}
            />
          ),
          tabBarLabel: ({ focused, color }) => (
            <Text
              style={{
                color: focused ? "coral" : "white",
                fontSize: 9,
                marginTop: -5,
                paddingBottom: 3,
              }}
            >
              Home
            </Text>
          ),
        }}
      />
      <Tab.Screen
        name="Search"
        component={SearchStack}
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <Entypo
              name="magnifying-glass"
              size={24}
              color={focused ? "coral" : "white"}
            />
          ),
          tabBarLabel: ({ focused, color }) => (
            <Text
              style={{
                color: focused ? "coral" : "white",
                fontSize: 9,
                marginTop: -5,
                paddingBottom: 3,
              }}
            >
              Search
            </Text>
          ),
        }}
      />
      <Tab.Screen
        name="Camera"
        component={CameraPage}
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <Entypo
              name="camera"
              size={24}
              color={focused ? "coral" : "white"}
            />
          ),
          tabBarLabel: ({ focused, color }) => (
            <Text
              style={{
                color: focused ? "coral" : "white",
                fontSize: 9,
                marginTop: -5,
                paddingBottom: 3,
              }}
            >
              Camera
            </Text>
          ),
          tabBarHideOnKeyboard: true
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileStack}
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name="person-circle"
              size={24}
              color={focused ? "coral" : "white"}
            />
          ),
          tabBarLabel: ({ focused, color }) => (
            <Text
              style={{
                color: focused ? "coral" : "white",
                fontSize: 9,
                marginTop: -5,
                paddingBottom: 3,
              }}
            >
              Profile
            </Text>
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default Routes;

export type RootStackParamList = {
  Home: undefined;
  DetailView: undefined;
  ImageDetailView: { item: any };
};
