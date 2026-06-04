import api from "./api";
import {
  AuthResponse,
  SignUpResponse,
  ProfileResponse,
  UserProfile,
} from "../types/auth";

export class AuthService {
  static async signUp(payload: any): Promise<UserProfile> {
    const response = await api.post<SignUpResponse>("/auth/signup", payload);
    return response.data.data;
  }

  static async login(payload: any): Promise<AuthResponse["data"]> {
    const response = await api.post<AuthResponse>("/auth/login", payload);
    return response.data.data;
  }

  static async googleLogin(googleIdToken: string): Promise<AuthResponse["data"]> {
    const response = await api.post<AuthResponse>("/auth/google", { idToken: googleIdToken });
    return response.data.data;
  }

  static async getProfile(): Promise<UserProfile> {
    const response = await api.get<ProfileResponse>("/auth/profile");
    return response.data.data;
  }
}
