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
      setErrors({ api: "Google Sign-In is not available in this environment (e.g., Expo Go). Please sign in using email & password or build a development build." });
      return;
    }
    try {
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      const response = await GoogleSignin.signIn();
      if (response.type !== "success") {
        // Sign-in was cancelled, in progress, or failed (we just exit silently)
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
    <ScreenWrapper className="bg-slate-50">
      <View className="flex-1 justify-center px-6 py-12">
        <View className="mb-10">
          <Text className="text-3xl font-bold text-slate-900">Welcome Back</Text>
          <Text className="mt-2 text-base text-slate-500">
            Log in to manage your account details.
          </Text>
        </View>

        {signupMessage && !errors.api && (
          <View className="mb-6 flex-row items-center rounded-2xl border border-green-100 bg-green-50 p-4">
            <Feather name="check-circle" size={20} color="#10B981" />
            <Text className="ml-3 flex-1 text-sm font-medium text-green-700">
              {signupMessage}
            </Text>
          </View>
        )}

        {errors.api && (
          <View className="mb-6 flex-row items-center rounded-2xl border border-red-100 bg-red-50 p-4">
            <Feather name="alert-circle" size={20} color="#EF4444" />
            <Text className="ml-3 flex-1 text-sm font-medium text-red-600">
              {errors.api}
            </Text>
          </View>
        )}

        <View className="gap-2">
          <Input
            label="Email Address"
            placeholder="john.doe@example.com"
            value={email}
            onChangeText={(val) => {
              setEmail(val);
              if (errors.email) setErrors((prev) => ({ ...prev, email: "" }));
            }}
            error={errors.email}
            keyboardType="email-address"
            icon={<Feather name="mail" size={20} color="#64748B" />}
          />

          <Input
            label="Password"
            placeholder="••••••••"
            value={password}
            onChangeText={(val) => {
              setPassword(val);
              if (errors.password) setErrors((prev) => ({ ...prev, password: "" }));
            }}
            error={errors.password}
            secureTextEntry
            icon={<Feather name="lock" size={20} color="#64748B" />}
          />
        </View>

        <Button
          title="Log In"
          className="mt-6"
          isLoading={loginMutation.isPending}
          onPress={handleLogin}
        />

        <Button
          title="Sign in with Google"
          variant="secondary"
          className="mt-3"
          isLoading={googleLoginMutation.isPending}
          onPress={handleGoogleLogin}
        />

        <View className="mt-8 flex-row justify-center gap-1.5">
          <Text className="text-sm text-slate-500">Don't have an account?</Text>
          <Link href="/signup" asChild>
            <Pressable>
              <Text className="text-sm font-bold text-[#0E4D92]">Sign Up</Text>
            </Pressable>
          </Link>
        </View>
      </View>
    </ScreenWrapper>
  );
}
