import React from "react";
import {
  ActivityIndicator,
  Pressable,
  Text,
  View,
  PressableProps,
} from "react-native";

interface ButtonProps extends PressableProps {
  title: string;
  isLoading?: boolean;
  variant?: "primary" | "secondary" | "danger";
  className?: string;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  isLoading = false,
  variant = "primary",
  className = "",
  icon,
  ...props
}) => {
  let bgClass = "bg-indigo-600 active:bg-indigo-700 dark:bg-indigo-500 dark:active:bg-indigo-600";
  let textClass = "text-white";

  if (variant === "secondary") {
    bgClass = "bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 active:bg-slate-200 dark:active:bg-slate-800";
    textClass = "text-slate-800 dark:text-slate-100";
  } else if (variant === "danger") {
    bgClass = "bg-red-500 active:bg-red-600";
    textClass = "text-white";
  }

  return (
    <Pressable
      className={`w-full items-center justify-center rounded-2xl py-4 active:scale-[0.99] transition-transform ${bgClass} ${className} ${
        props.disabled || isLoading ? "opacity-60" : ""
      }`}
      disabled={isLoading || !!props.disabled}
      {...props}
    >
      {isLoading ? (
        <ActivityIndicator
          color={variant === "secondary" ? (variant === "secondary" && bgClass.includes("dark") ? "#FFFFFF" : "#1E293B") : "#FFFFFF"}
        />
      ) : (
        <View className="flex-row items-center justify-center gap-2">
          {icon}
          <Text className={`text-base font-bold tracking-wide ${textClass}`}>{title}</Text>
        </View>
      )}
    </Pressable>
  );
};
