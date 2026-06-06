import React from "react";
import { View, Text, useColorScheme } from "react-native";
import Svg, { Circle } from "react-native-svg";

interface CharacterCounterProps {
  count: number;
  maxLength?: number;
  size?: number;
  strokeWidth?: number;
}

export const CharacterCounter: React.FC<CharacterCounterProps> = ({
  count,
  maxLength = 500,
  size = 28,
  strokeWidth = 2.5,
}) => {
  const remaining = maxLength - count;
  const percentage = Math.min(count / maxLength, 1);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - percentage * circumference;
  const colorScheme = useColorScheme();

  // Determine indicator color based on count proximity to maxLength
  let strokeColor = "#6366F1"; // indigo-500 (default premium)
  let textStyle = "text-slate-400 dark:text-slate-500";

  if (percentage >= 0.9) {
    strokeColor = "#EF4444"; // red-500 (danger)
    textStyle = "text-red-500 font-semibold";
  } else if (percentage >= 0.8) {
    strokeColor = "#F59E0B"; // amber-500 (warning)
    textStyle = "text-amber-500 font-medium";
  }

  // Show a remaining count text if within 50 characters of max
  const showRemainingText = remaining <= 50;
  const isDark = colorScheme === "dark";
  const trackColor = isDark ? "#1E293B" : "#E2E8F0";

  return (
    <View className="flex-row items-center space-x-2">
      {showRemainingText && (
        <Text className={`text-xs ${textStyle}`}>
          {remaining}
        </Text>
      )}
      <View style={{ width: size, height: size }} className="items-center justify-center">
        <Svg width={size} height={size} style={{ transform: [{ rotate: "-90deg" }] }}>
          {/* Background Track */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={strokeWidth}
            stroke={trackColor}
            fill="transparent"
          />
          {/* Active Fill Ring */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={strokeWidth}
            stroke={strokeColor}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </Svg>
      </View>
    </View>
  );
};
