import React, { useState, useEffect } from "react";
import { Text, TextInput, TextInputProps, View, Pressable } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
} from "react-native-reanimated";
import { Feather } from "@expo/vector-icons";

interface InputProps extends TextInputProps {
  label: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  icon,
  value = "",
  secureTextEntry,
  onFocus,
  onBlur,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const focusAnim = useSharedValue(value && value.length > 0 ? 1 : 0);

  useEffect(() => {
    if (value && value.length > 0) {
      focusAnim.value = withTiming(1, { duration: 150 });
    } else if (!isFocused) {
      focusAnim.value = withTiming(0, { duration: 150 });
    }
  }, [value, isFocused]);

  const handleFocus = (e: any) => {
    setIsFocused(true);
    focusAnim.value = withTiming(1, { duration: 150 });
    if (onFocus) onFocus(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    if (!value || value.length === 0) {
      focusAnim.value = withTiming(0, { duration: 150 });
    }
    if (onBlur) onBlur(e);
  };

  const labelAnimatedStyle = useAnimatedStyle(() => {
    const translateY = interpolate(focusAnim.value, [0, 1], [0, -10]);
    const scale = interpolate(focusAnim.value, [0, 1], [1, 0.8]);
    return {
      transform: [{ translateY }, { scale }],
    };
  });

  const isPassword = secureTextEntry;
  const isSecure = isPassword && !showPassword;

  // Left offset for label depending on whether there is a left icon
  const labelLeftOffset = icon ? "left-11" : "left-4";

  return (
    <View className="mb-4.5 w-full">
      <View
        className={`flex-row items-center rounded-2xl border px-4 h-[56px] relative bg-white dark:bg-[#121215] ${
          error
            ? "border-red-500"
            : isFocused
            ? "border-indigo-500 dark:border-indigo-500"
            : "border-slate-200 dark:border-slate-800/80"
        }`}
      >
        {icon && (
          <View className="mr-2.5 items-center justify-center">
            {icon}
          </View>
        )}

        {/* Floating Label Container */}
        <Animated.View
          pointerEvents="none"
          style={labelAnimatedStyle}
          className={`absolute ${labelLeftOffset}`}
        >
          <Text
            className={`font-semibold ${
              error
                ? "text-red-500"
                : isFocused
                ? "text-indigo-500"
                : "text-slate-400 dark:text-slate-500"
            }`}
          >
            {label}
          </Text>
        </Animated.View>

        <TextInput
          className="flex-1 text-[15px] text-slate-800 dark:text-slate-100 font-medium h-full pt-3"
          placeholder=""
          value={value}
          onFocus={handleFocus}
          onBlur={handleBlur}
          secureTextEntry={isSecure}
          autoCapitalize="none"
          {...props}
        />

        {isPassword && (
          <Pressable
            onPress={() => setShowPassword(!showPassword)}
            className="ml-2 h-9 w-9 items-center justify-center rounded-xl active:bg-slate-100 dark:active:bg-slate-800"
            hitSlop={8}
          >
            <Feather
              name={showPassword ? "eye-off" : "eye"}
              size={18}
              color="#94A3B8"
            />
          </Pressable>
        )}
      </View>
      {error && (
        <Text className="mt-1.5 ml-2 text-xs font-semibold text-red-500">{error}</Text>
      )}
    </View>
  );
};
