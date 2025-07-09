import { ReactNode } from "react";

export interface User {
  id: number;
  email?: string;
  username?: string; // This contains the roll number for students
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
    username?: string; // Changed from roll_number to username
    password: string;
  }) => Promise<void>;
  logout: () => void;
  refreshAccessToken: () => Promise<void>;
}

export interface AuthProviderProps {
  children: ReactNode;
}
