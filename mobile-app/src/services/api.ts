import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";

// Helper to determine the backend API URL dynamically:
// - Android Emulator maps localhost to 10.0.2.2
// - iOS Simulator uses localhost
// - Physical device uses the local machine's IP (extracted from Expo hostUri)
const getBaseUrl = (): string => {
  // Use production backend URL if provided in environment
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  // hostUri has format like: 192.168.1.5:8081
  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    const ip = hostUri.split(":")[0];
    return `http://${ip}:5000`;
  }
  return "http://localhost:5000";
};

export const API_URL = getBaseUrl();
console.log("🔗 Backend API URL Configured:", API_URL);

const api = axios.create({
  baseURL: `${API_URL}/api`,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Automatically inject Bearer token into requests if it exists in local storage
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem("auth_token");
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      console.error("Failed to fetch auth token from storage:", e);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Hold callback to trigger logout on token expiration
let onUnauthorizedCallback: (() => void) | null = null;

export const setUnauthorizedHandler = (callback: () => void) => {
  onUnauthorizedCallback = callback;
};

// Handle 401 Unauthorized responses (token expiration) globally
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response && error.response.status === 401) {
      if (onUnauthorizedCallback) {
        onUnauthorizedCallback();
      }
    }
    return Promise.reject(error);
  }
);

export default api;
