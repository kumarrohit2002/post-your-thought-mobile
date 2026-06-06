import React from "react";
import { View, Text, Image } from "react-native";

interface AvatarProps {
  name: string;
  uri?: string;
  size?: number;
}

export const Avatar: React.FC<AvatarProps> = ({ name, uri, size = 40 }) => {
  const initials = name
    ? name
        .split(" ")
        .filter(Boolean)
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "U";

  // Generate deterministic HSL color based on the username to make it visually distinct
  const getHashColor = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const h = Math.abs(hash) % 360;
    // Saturation 65%, Lightness 42% for deep premium look
    return `hsl(${h}, 65%, 42%)`;
  };

  const backgroundColor = getHashColor(name || "User");

  // Check if uri is valid image path and not empty/placeholder
  const hasImage = uri && uri.trim() !== "" && !uri.includes("ui-avatars.com");

  return (
    <View
      className="items-center justify-center overflow-hidden rounded-full border border-slate-100/50 dark:border-slate-800/50"
      style={{ width: size, height: size, backgroundColor }}
    >
      {hasImage ? (
        <Image
          source={{ uri }}
          style={{ width: size, height: size }}
          resizeMode="cover"
        />
      ) : (
        <Text
          className="font-semibold text-white tracking-wide"
          style={{ fontSize: size * 0.4 }}
        >
          {initials}
        </Text>
      )}
    </View>
  );
};
