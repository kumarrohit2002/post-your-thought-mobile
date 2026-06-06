import React from "react";
import { View, Text } from "react-native";
import { Feather } from "@expo/vector-icons";
import { Button } from "./Button";

interface EmptyStateProps {
  title: string;
  message: string;
  iconName?: keyof typeof Feather.glyphMap;
  actionTitle?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  message,
  iconName = "message-square",
  actionTitle,
  onAction,
}) => {
  return (
    <View className="items-center justify-center p-8 bg-transparent my-10">
      <View className="mb-4 h-16 w-16 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800/60">
        <Feather name={iconName} size={28} color="#6366F1" className="text-slate-500 dark:text-indigo-400" />
      </View>
      <Text className="text-lg font-bold text-slate-800 dark:text-slate-100 text-center">{title}</Text>
      <Text className="mt-2 text-sm leading-5 text-slate-400 dark:text-slate-500 text-center max-w-[280px]">
        {message}
      </Text>
      {actionTitle && onAction && (
        <Button
          title={actionTitle}
          variant="secondary"
          className="mt-6 px-6"
          onPress={onAction}
        />
      )}
    </View>
  );
};
