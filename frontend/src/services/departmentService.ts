import axios from "axios";
import { API_BASE_URL } from "./api";
import { DepartmentDue } from "../types/department";

export interface StaffProfile {
  name: string;
  designation: string;
  department: string;
  phone_number: string;
  email: string;
}

export interface AddDueData {
  student: string;
  amount: string;
  due_date: string;
  description: string;
  department: string;
}

export const getDepartmentDues = async (
  department: string
): Promise<DepartmentDue[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/dues/`, {
      params: { department },
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching department dues:", error);
    throw error;
  }
};

export const markDueAsPaid = async (dueId: number): Promise<void> => {
  try {
    await axios.post(
      `${API_BASE_URL}/dues/${dueId}/mark_as_paid/`,
      {},
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      }
    );
  } catch (error) {
    console.error("Error marking due as paid:", error);
    throw error;
  }
};

export const addDepartmentDue = async (
  data: AddDueData
): Promise<DepartmentDue> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/dues/`, data, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error adding department due:", error);
    throw error;
  }
};

export const getStaffProfile = async (): Promise<StaffProfile> => {
  try {
    console.log(
      "Fetching staff profile from:",
      `${API_BASE_URL}/staff/profile/`
    );
    console.log("Using access token:", localStorage.getItem("accessToken"));

    const response = await axios.get(`${API_BASE_URL}/staff/profile/`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
    });

    console.log("Staff profile response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching staff profile:", error);
    if (axios.isAxiosError(error)) {
      console.error("Error details:", {
        status: error.response?.status,
        data: error.response?.data,
        headers: error.response?.headers,
      });
    }
    throw error;
  }
};

export const searchStudentsByRollNumber = async (
  query: string
): Promise<any[]> => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/students/search/?q=${query}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error searching students:", error);
    throw error;
  }
};

export const getAcademicDues = async (): Promise<any[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/dues/academic-dues/`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching academic dues:", error);
    throw error;
  }
};

export const getStudentProfileByRoll = async (rollNumber: string) => {
  const response = await axios.get(
    `${API_BASE_URL}/students/search/?q=${rollNumber}`,
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
    }
  );
  // The API returns a list, so find the exact match
  return response.data.find((s: any) => s.roll_number === rollNumber);
};
