import axios from "axios";
import { API_BASE_URL } from "./api";

export interface LibraryDue {
  id: number;
  student: {
    id: number;
    roll_number: string;
    first_name: string;
    last_name: string;
    email: string;
    course: string;
  };
  description: string;
  amount: number;
  due_date: string;
  is_paid: boolean;
  created_at: string;
}

export const getLibraryDues = async (): Promise<LibraryDue[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/dues/`);
    console.log("Library Dues Response:", response.data); // Debug log
    return response.data;
  } catch (error) {
    console.error("Error fetching library dues:", error);
    throw error;
  }
};
