import api from "./api";
import { isAxiosError } from "axios";
import { DepartmentDue } from "../types/department";
import { AcademicDue } from "../types/staffDashboardTypes";

export interface HostelDue {
  id: number;
  student: {
    roll_number: string; // This comes from user.username in the backend
    full_name: string;
    phone_number: string;
    caste: string;
    course: string;
  };
  year_of_study: string;
  mess_bill: number;
  scholarship: number;
  deposit: number;
  remarks: string;
  total_amount: number;
  due_amount: number;
}

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

export interface AcademicDuesResponse {
  results: AcademicDue[];
  total_due_amount: number;
}

export const getDepartmentDues = async (
  department?: string
): Promise<DepartmentDue[]> => {
  try {
    const accessToken =
      localStorage.getItem("studentAccessToken") ||
      localStorage.getItem("staffAccessToken");
    if (!accessToken) {
      throw new Error("No access token found. Please log in again.");
    }

    // For other departments, use the regular dues endpoint
    const params = department ? { department } : {};
    const response = await api.get("/dues/dues/", {
      params,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (response.data && typeof response.data === "object") {
      // Check if it's a paginated response
      if (Array.isArray(response.data.results)) {
        return response.data.results;
      }
      // Check if it's a direct array
      if (Array.isArray(response.data)) {
        return response.data;
      }
      // If it's a single object, wrap it in an array
      if (response.data.id) {
        return [response.data];
      }
      // If it's an empty object, return empty array
      if (Object.keys(response.data).length === 0) {
        return [];
      }
      // If it's a paginated response without results array
      if (response.data.count !== undefined) {
        return [];
      }
    }

    throw new Error("Invalid response format from server");
  } catch (error) {
    if (isAxiosError(error)) {
      if (error.response?.status === 401) {
        // Clear the invalid token
        localStorage.removeItem("studentAccessToken");
        localStorage.removeItem("staffAccessToken");
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
    await api.post(
      `/dues/${dueId}/mark_as_paid/`,
      {},
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      }
    );
  } catch (error) {
    throw error;
  }
};

export const addDepartmentDue = async (
  data: AddDueData
): Promise<DepartmentDue> => {
  try {
    const response = await api.post(`/dues/`, data, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getStaffProfile = async (): Promise<StaffProfile> => {
  let accessToken = localStorage.getItem("staffAccessToken") || "";
  const refreshToken = localStorage.getItem("refreshToken");

  if (!accessToken) {
    throw new Error("No access token found. Please log in again.");
  }

  try {
    const response = await api.get(`/staff/profile/`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return response.data;
  } catch (error: any) {
    // If 401, try to refresh token
    if (isAxiosError(error) && error.response?.status === 401 && refreshToken) {
      try {
        // Attempt to refresh the token
        const res = await api.post(`/auth/token/refresh/`, {
          refresh: refreshToken,
        });
        accessToken = res.data.access || "";
        localStorage.setItem("staffAccessToken", accessToken);
        api.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;
        // Retry the original request
        const retryResponse = await api.get(`/staff/profile/`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        return retryResponse.data;
      } catch (refreshError) {
        // Refresh failed, log out
        localStorage.removeItem("staffAccessToken");
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
    const response = await api.get(`/students/search/?q=${query}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getAcademicDues = async (): Promise<AcademicDuesResponse> => {
  try {
    const accessToken =
      localStorage.getItem("staffAccessToken") ||
      localStorage.getItem("studentAccessToken");
    if (!accessToken) {
      throw new Error("No access token found. Please log in again.");
    }

    const response = await api.get("/dues/academic-dues/", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return response.data;
  } catch (error) {
    if (isAxiosError(error)) {
      if (error.response?.status === 401) {
        // Clear the invalid token
        localStorage.removeItem("studentAccessToken");
        localStorage.removeItem("staffAccessToken");
        throw new Error("Your session has expired. Please log in again.");
      } else if (error.response?.status === 403) {
        throw new Error("You don't have permission to view academic dues");
      }
    }
    throw error;
  }
};

export const getStudentProfileByRoll = async (rollNumber: string) => {
  const response = await api.get(`/students/search/?q=${rollNumber}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
    },
  });
  // The API returns a list, so find the exact match
  return response.data.find((s: any) => s.roll_number === rollNumber);
};

export const updateAcademicDue = async (
  id: number,
  data: { paid_by_govt: number; paid_by_student: number }
): Promise<any> => {
  try {
    const accessToken =
      localStorage.getItem("staffAccessToken") ||
      localStorage.getItem("studentAccessToken");
    const response = await api.patch(`/dues/academic-dues/${id}/`, data, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getHostelDues = async (): Promise<any[]> => {
  try {
    const accessToken =
      localStorage.getItem("studentAccessToken") ||
      localStorage.getItem("staffAccessToken");
    if (!accessToken) {
      throw new Error("No access token found. Please log in again.");
    }

    const response = await api.get(`/dues/hostel-dues/`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (Array.isArray(response.data)) {
      return response.data;
    }

    if (response.data && typeof response.data === "object") {
      if (Array.isArray(response.data.results)) {
        return response.data.results;
      }
      if (response.data.id) {
        return [response.data];
      }
    }

    return [];
  } catch (error) {
    if (isAxiosError(error)) {
      if (error.response?.status === 401) {
        // Clear the invalid token
        localStorage.removeItem("studentAccessToken");
        localStorage.removeItem("staffAccessToken");
        throw new Error("Your session has expired. Please log in again.");
      }
    }
    throw error;
  }
};

export const updateHostelDue = async (
  dueId: number,
  data: {
    mess_bill: number;
    scholarship: number;
    deposit: number;
    remarks: string;
  }
): Promise<HostelDue> => {
  const accessToken = localStorage.getItem("staffAccessToken");
  const refreshToken = localStorage.getItem("refreshToken");

  if (!accessToken) {
    throw new Error("No access token found. Please log in again.");
  }

  try {
    const response = await api.put(`/dues/hostel-dues/${dueId}/`, data, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return response.data;
  } catch (error: any) {
    // If 401, try to refresh token
    if (isAxiosError(error) && error.response?.status === 401 && refreshToken) {
      try {
        // Attempt to refresh the token
        const res = await api.post(`/auth/token/refresh/`, {
          refresh: refreshToken,
        });
        const newAccessToken = res.data.access;
        localStorage.setItem("staffAccessToken", newAccessToken);
        api.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${newAccessToken}`;

        // Retry the original request with new token
        const retryResponse = await api.put(
          `/dues/hostel-dues/${dueId}/`,
          data,
          {
            headers: {
              Authorization: `Bearer ${newAccessToken}`,
            },
          }
        );
        return retryResponse.data;
      } catch (refreshError) {
        // Refresh failed, log out
        localStorage.removeItem("staffAccessToken");
        localStorage.removeItem("refreshToken");
        window.location.href = "/staff-login";
        throw new Error("Session expired. Please log in again.");
      }
    }
    throw error;
  }
};
