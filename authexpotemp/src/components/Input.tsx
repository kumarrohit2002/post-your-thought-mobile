import React from "react";
import { Text, TextInput, TextInputProps, View } from "react-native";

interface InputProps extends TextInputProps {
  label: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  icon,
  ...props
}) => {
  return (
    <View className="mb-4 w-full">
      <Text className="mb-1.5 text-sm font-medium text-slate-700">
        {label}
      </Text>
      <View
        className={`flex-row items-center rounded-2xl border bg-white px-4 py-3.5 ${
          error ? "border-red-500" : "border-slate-200"
        }`}
      >
        {icon && <View className="mr-3">{icon}</View>}
        <TextInput
          className="flex-1 text-base text-slate-900"
          placeholderTextColor="#94A3B8"
          autoCapitalize="none"
          {...props}
        />
      </View>
      {error && (
        <Text className="mt-1 text-xs font-medium text-red-500">{error}</Text>
      )}
    </View>
  );
};
