import React, { useState, useRef } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  Animated,
  ScrollView,
  StatusBar,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";

const Header = ({ title }) => {
  const scrollY = useRef(new Animated.Value(0)).current;
  const [headerVisible, setHeaderVisible] = useState(true);

  return (
    <View className="bg-fifth h-20 mt-0 flex items-center justify-center">
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor={"transparent"}
      />
      <View className="opacity-70 rotate-45 pt-4">
        <FontAwesome
          name="camera-retro"
          size={20}
          color="coral"
          left={40}
          top={-41}
        />
      </View>
      <Text className="absolute top-8 decoration-sky-500 text-white pt-4 text-xl font-bold">
        {title}
      </Text>
    </View>
  );
};

export default Header;
