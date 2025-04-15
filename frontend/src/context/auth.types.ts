import { ReactNode } from "react";

export interface User {
  id: number;
  email?: string;
  roll_number?: string;
  name: string;
  user_type: "student" | "staff";
}

export interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  error: string | null;
  login: (credentials: {
    email?: string;
    roll_number?: string;
    password: string;
  }) => Promise<void>;
  logout: () => void;
  refreshAccessToken: () => Promise<void>;
}

export interface AuthProviderProps {
  children: ReactNode;
}