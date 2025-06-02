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
  department?: string
): Promise<DepartmentDue[]> => {
  try {
    const accessToken = localStorage.getItem("accessToken");
    console.log("Access token present:", !!accessToken);

    if (!accessToken) {
      throw new Error("No access token found. Please log in again.");
    }

    console.log("Fetching department dues for:", department);

    // If department is hostel, use hostel-dues endpoint
    if (department === "hostel_superintendent") {
      const response = await axios.get(`${API_BASE_URL}/dues/hostel-dues/`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      console.log("Raw hostel dues response:", response.data);
      return response.data;
    }

    // For other departments, use the regular dues endpoint
    const params = department ? { department } : {};
    const response = await axios.get(`${API_BASE_URL}/dues/dues/`, {
      params,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    console.log("Raw response data:", response.data);

    // Django REST Framework returns paginated data by default
    if (response.data && typeof response.data === "object") {
      // Check if it's a paginated response
      if (Array.isArray(response.data.results)) {
        console.log("Found paginated results:", response.data.results);
        return response.data.results;
      }
      // Check if it's a direct array
      if (Array.isArray(response.data)) {
        console.log("Found direct array:", response.data);
        return response.data;
      }
      // If it's a single object, wrap it in an array
      if (response.data.id) {
        console.log("Found single object:", response.data);
        return [response.data];
      }
      // If it's an empty object, return empty array
      if (Object.keys(response.data).length === 0) {
        console.log("Found empty object, returning empty array");
        return [];
      }
      // If it's a paginated response without results array
      if (response.data.count !== undefined) {
        console.log(
          "Found paginated response without results array:",
          response.data
        );
        return [];
      }
    }

    console.error("Invalid response format:", response.data);
    throw new Error("Invalid response format from server");
  } catch (error) {
    console.error("Error fetching department dues:", error);
    if (axios.isAxiosError(error)) {
      console.error("Axios error details:", {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        headers: error.response?.headers,
      });
      if (error.response?.status === 401) {
        // Clear the invalid token
        localStorage.removeItem("accessToken");
        throw new Error("Your session has expired. Please log in again.");
      } else if (error.response?.status === 403) {
        throw new Error("You don't have permission to view these dues");
      } else {
        throw new Error(
          error.response?.data?.message || "Failed to fetch department dues"
        );
      }
    }
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
  let accessToken = localStorage.getItem("accessToken") || "";
  const refreshToken = localStorage.getItem("refreshToken");

  if (!accessToken) {
    throw new Error("No access token found. Please log in again.");
  }

  try {
    const response = await axios.get(`${API_BASE_URL}/staff/profile/`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return response.data;
  } catch (error: any) {
    // If 401, try to refresh token
    if (
      axios.isAxiosError(error) &&
      error.response?.status === 401 &&
      refreshToken
    ) {
      try {
        // Attempt to refresh the token
        const res = await axios.post(`${API_BASE_URL}/auth/token/refresh/`, {
          refresh: refreshToken,
        });
        accessToken = res.data.access || "";
        localStorage.setItem("accessToken", accessToken);
        axios.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${accessToken}`;
        // Retry the original request
        const retryResponse = await axios.get(
          `${API_BASE_URL}/staff/profile/`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        return retryResponse.data;
      } catch (refreshError) {
        // Refresh failed, log out
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        window.location.href = "/staff-login";
        throw new Error("Session expired. Please log in again.");
      }
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

export const updateAcademicDue = async (
  id: number,
  data: { paid_by_govt: number; paid_by_student: number }
): Promise<any> => {
  try {
    const response = await axios.patch(
      `${API_BASE_URL}/dues/academic-dues/${id}/`,
      data,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error updating academic due:", error);
    throw error;
  }
};

export const getHostelDues = async (): Promise<any[]> => {
  try {
    const accessToken = localStorage.getItem("accessToken");
    console.log("Access token present:", !!accessToken);

    if (!accessToken) {
      throw new Error("No access token found. Please log in again.");
    }

    console.log("Fetching hostel dues...");
    const response = await axios.get(`${API_BASE_URL}/dues/hostel-dues/`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    console.log("Raw hostel dues response:", response.data);

    if (Array.isArray(response.data)) {
      console.log("Found hostel dues array:", response.data);
      return response.data;
    }

    if (response.data && typeof response.data === "object") {
      if (Array.isArray(response.data.results)) {
        console.log("Found paginated hostel dues:", response.data.results);
        return response.data.results;
      }
      if (response.data.id) {
        console.log("Found single hostel due:", response.data);
        return [response.data];
      }
    }

    console.error("Invalid hostel dues response format:", response.data);
    return [];
  } catch (error) {
    console.error("Error fetching hostel dues:", error);
    if (axios.isAxiosError(error)) {
      console.error("Error details:", {
        status: error.response?.status,
        data: error.response?.data,
        headers: error.response?.headers,
      });
      if (error.response?.status === 401) {
        // Clear the invalid token
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        throw new Error("Your session has expired. Please log in again.");
      }
    }
    throw error;
  }
};

export const updateHostelDue = async (
  dueId: number,
  data: {
    mess_bill?: number;
    scholarship?: number;
    deposit?: number;
    remarks?: string;
  }
): Promise<any> => {
  try {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      throw new Error("No access token found. Please log in again.");
    }

    const response = await axios.patch(
      `${API_BASE_URL}/dues/hostel-dues/${dueId}/`,
      data,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error updating hostel due:", error);
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        localStorage.removeItem("accessToken");
        throw new Error("Your session has expired. Please log in again.");
      }
      throw new Error(
        error.response?.data?.error || "Failed to update hostel due"
      );
    }
    throw error;
  }
};
