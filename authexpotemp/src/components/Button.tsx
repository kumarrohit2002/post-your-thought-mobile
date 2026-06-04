import React from "react";
import {
  ActivityIndicator,
  Pressable,
  Text,
  PressableProps,
} from "react-native";

interface ButtonProps extends PressableProps {
  title: string;
  isLoading?: boolean;
  variant?: "primary" | "secondary" | "danger";
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  isLoading = false,
  variant = "primary",
  className = "",
  ...props
}) => {
  let bgClass = "bg-[#0E4D92]";
  let textClass = "text-white";

  if (variant === "secondary") {
    bgClass = "bg-slate-100 border border-slate-200";
    textClass = "text-slate-800";
  } else if (variant === "danger") {
    bgClass = "bg-red-500";
    textClass = "text-white";
  }

  return (
    <Pressable
      className={`w-full items-center justify-center rounded-2xl py-4 active:opacity-90 ${bgClass} ${className} ${
        props.disabled || isLoading ? "opacity-60" : ""
      }`}
      disabled={isLoading || !!props.disabled}
      {...props}
    >
      {isLoading ? (
        <ActivityIndicator
          color={variant === "secondary" ? "#1E293B" : "#FFFFFF"}
        />
      ) : (
        <Text className={`text-base font-bold ${textClass}`}>{title}</Text>
      )}
    </Pressable>
  );
};
