import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { setUnauthorizedHandler } from "../services/api";

let GoogleSignin: any = null;
try {
  GoogleSignin = require("@react-native-google-signin/google-signin").GoogleSignin;
} catch (error) {
  console.warn("Google Sign-In is not available in this environment. Google Sign-In will be disabled.");
}

interface AuthContextType {
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  saveToken: (token: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Configure Google Sign-In on app mount if available
  useEffect(() => {
    if (GoogleSignin) {
      try {
        GoogleSignin.configure({
          webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || "124102137395-6sv9v5il43oblh6sek0hpotdp4hgl6ct.apps.googleusercontent.com",
        });
      } catch (error) {
        console.warn("Failed to configure Google Sign-In:", error);
      }
    }
  }, []);

  // Restore the session from AsyncStorage when the app boots
  useEffect(() => {
    const loadToken = async () => {
      try {
        const storedToken = await AsyncStorage.getItem("auth_token");
        if (storedToken) {
          setToken(storedToken);
        }
      } catch (error) {
        console.error("Error loading auth token from AsyncStorage:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadToken();
  }, []);

  const saveToken = async (newToken: string) => {
    try {
      await AsyncStorage.setItem("auth_token", newToken);
      setToken(newToken);
    } catch (error) {
      console.error("Error saving token to AsyncStorage:", error);
    }
  };

  const logout = useCallback(async () => {
    try {
      await AsyncStorage.removeItem("auth_token");
      if (GoogleSignin) {
        try {
          const isSignedIn = await GoogleSignin.isSignedIn();
          if (isSignedIn) {
            await GoogleSignin.signOut();
          }
        } catch (googleError) {
          console.warn("Error signing out from Google:", googleError);
        }
      }
      setToken(null);
    } catch (error) {
      console.error("Error removing token from AsyncStorage:", error);
    }
  }, []);

  // Automatically log out user if a 401 Unauthorized (expired token) response is received
  useEffect(() => {
    setUnauthorizedHandler(logout);
    return () => {
      setUnauthorizedHandler(() => {});
    };
  }, [logout]);

  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider
      value={{ token, isAuthenticated, isLoading, saveToken, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
