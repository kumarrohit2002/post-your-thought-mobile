import React, { useState } from "react";
import { Text, View, Pressable } from "react-native";
import { Link, useLocalSearchParams } from "expo-router";
import { ScreenWrapper } from "../src/components/ScreenWrapper";
import { Input } from "../src/components/Input";
import { Button } from "../src/components/Button";
import { useLoginMutation, useGoogleLoginMutation } from "../src/hooks/useAuthMutations";
let GoogleSignin: any = null;
try {
  GoogleSignin = require("@react-native-google-signin/google-signin").GoogleSignin;
} catch (error) {
  // Handled at login runtime
}
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

export default function Login() {
  const params = useLocalSearchParams();
  const loginMutation = useLoginMutation();
  const googleLoginMutation = useGoogleLoginMutation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validate = () => {
    const newErrors: { [key: string]: string } = {};

    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Invalid email format";
    }

    if (!password) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = () => {
    if (!validate()) return;

    loginMutation.mutate(
      { email, password },
      {
        onError: (err: any) => {
          const apiError =
            err.response?.data?.message ||
            err.message ||
            "Failed to sign in. Please verify credentials.";
          setErrors({ api: apiError });
        },
      }
    );
  };

  const handleGoogleLogin = async () => {
    if (!GoogleSignin) {
      setErrors({ api: "Google Sign-In is not available in Expo Go. Please sign in using email & password." });
      return;
    }
    try {
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      const response = await GoogleSignin.signIn();
      if (response.type !== "success") {
        return;
      }
      const idToken = response.data.idToken;
      if (!idToken) {
        throw new Error("No ID token returned from Google Sign-In");
      }
      googleLoginMutation.mutate(idToken, {
        onError: (err: any) => {
          const apiError =
            err.response?.data?.message ||
            err.message ||
            "Failed to sign in with Google.";
          setErrors({ api: apiError });
        },
      });
    } catch (error: any) {
      console.error("Google Sign-In Error:", error);
      if (error.code !== "SIGN_IN_CANCELLED" && error.code !== "12501") {
        setErrors({ api: error.message || "Google Sign-In failed." });
      }
    }
  };

  const signupMessage = params?.message as string | undefined;

  return (
    <ScreenWrapper className="bg-slate-50 dark:bg-[#0A0A0C]">
      {/* Decorative Glow Elements */}
      <View className="absolute top-[-100px] left-[-100px] w-[350px] h-[350px] rounded-full bg-indigo-500/10 dark:bg-indigo-600/5 blur-[80px]" />
      <View className="absolute bottom-[-100px] right-[-100px] w-[350px] h-[350px] rounded-full bg-purple-500/10 dark:bg-purple-600/5 blur-[80px]" />

      <View className="flex-1 justify-center px-6 py-12">
        {/* Welcome Section */}
        <View className="mb-8 items-center">
          <View className="h-16 w-16 items-center justify-center rounded-2xl bg-indigo-500/10 dark:bg-indigo-500/20 border border-indigo-500/20 dark:border-indigo-500/30 mb-4 shadow-sm shadow-indigo-500/20">
            <Feather name="edit-3" size={28} color="#6366F1" />
          </View>
          <Text className="text-3xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight">
            Welcome Back
          </Text>
          <Text className="mt-2 text-[15px] text-slate-500 dark:text-slate-400 text-center px-4">
            Connect to your thoughts, share them instantly with the world.
          </Text>
        </View>

        {/* Premium Carbon Card Wrapper */}
        <View className="bg-white dark:bg-[#121215] border border-slate-100 dark:border-slate-800/60 rounded-3xl p-6 shadow-xl shadow-slate-200/50 dark:shadow-none mb-6">
          {signupMessage && !errors.api && (
            <View className="mb-5 flex-row items-center rounded-2xl border border-green-100 dark:border-green-950/20 bg-green-50 dark:bg-green-950/10 p-4">
              <Feather name="check-circle" size={18} color="#10B981" />
              <Text className="ml-3 flex-1 text-sm font-semibold text-green-700 dark:text-green-400">
                {signupMessage}
              </Text>
            </View>
          )}

          {errors.api && (
            <View className="mb-5 flex-row items-center rounded-2xl border border-red-100 dark:border-red-950/20 bg-red-50 dark:bg-red-950/10 p-4">
              <Feather name="alert-circle" size={18} color="#EF4444" />
              <Text className="ml-3 flex-1 text-sm font-semibold text-red-600 dark:text-red-400">
                {errors.api}
              </Text>
            </View>
          )}

          <View className="gap-1">
            <Input
              label="Email Address"
              value={email}
              onChangeText={(val) => {
                setEmail(val);
                if (errors.email) setErrors((prev) => ({ ...prev, email: "" }));
              }}
              error={errors.email}
              keyboardType="email-address"
              icon={<Feather name="mail" size={18} color="#6366F1" />}
            />

            <Input
              label="Password"
              value={password}
              onChangeText={(val) => {
                setPassword(val);
                if (errors.password) setErrors((prev) => ({ ...prev, password: "" }));
              }}
              error={errors.password}
              secureTextEntry
              icon={<Feather name="lock" size={18} color="#6366F1" />}
            />
          </View>

          <Button
            title="Log In"
            className="mt-4"
            isLoading={loginMutation.isPending}
            onPress={handleLogin}
          />

          <View className="flex-row items-center my-5">
            <View className="flex-1 h-[1px] bg-slate-100 dark:bg-slate-800" />
            <Text className="mx-4 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
              or
            </Text>
            <View className="flex-1 h-[1px] bg-slate-100 dark:bg-slate-800" />
          </View>

          <Button
            title="Continue with Google"
            variant="secondary"
            isLoading={googleLoginMutation.isPending}
            onPress={handleGoogleLogin}
            icon={<Feather name="chrome" size={16} color="#64748B" />}
          />
        </View>

        {/* Signup Redirect */}
        <View className="flex-row justify-center gap-1.5 mt-2">
          <Text className="text-[14.5px] text-slate-500 dark:text-slate-400">
            {"Don't have an account?"}
          </Text>
          <Link href="/signup" asChild>
            <Pressable>
              <Text className="text-[14.5px] font-extrabold text-indigo-600 dark:text-indigo-400">
                Sign Up
              </Text>
            </Pressable>
          </Link>
        </View>
      </View>
    </ScreenWrapper>
  );
}
