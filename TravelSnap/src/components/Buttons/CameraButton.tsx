import { Entypo } from "@expo/vector-icons";
import React from "react";
import { TouchableOpacity, GestureResponderEvent, Text } from "react-native";

type CameraButtonProps = {
    title: string;
    icon: keyof typeof Entypo.glyphMap;
    color: string;
    onPress?: (event: GestureResponderEvent) => void;
}

const CameraButton = ({ title, icon, color, onPress }: CameraButtonProps) => {
    return (
        <TouchableOpacity className="h-2.5 flex-row items-center justify-center" onPress={onPress}>
            <Entypo name={icon} size={28} color={color ? color : '#f1f1f1'} />
            <Text className="font-bold text-base text-white ml-5">{title}</Text>
        </TouchableOpacity>
    )
}

export default CameraButton;
