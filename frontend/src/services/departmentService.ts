import api from "./api";
import { isAxiosError } from "axios";
import { DepartmentDue } from "../types/department";
import {
  AcademicDue,
  LegacyRecord,
  LegacyStudentGroup,
} from "../types/staffDashboardTypes";

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

export interface LegacyRecordsResponse {
  results: LegacyRecord[];
  total_due_amount: number;
}

export interface LegacyStatistics {
  total_records: number;
  records_with_dues: number;
  records_without_dues: number;
  total_due_amount: number;
  tc_issued_count: number;
  year_statistics: Array<{
    year: number;
    count: number;
    total_amount: number;
    avg_amount: number;
  }>;
  course_statistics: Array<{
    student__course__name: string;
    count: number;
    total_amount: number;
    avg_amount: number;
  }>;
  caste_statistics: Array<{
    student__caste: string;
    count: number;
    total_amount: number;
    avg_amount: number;
  }>;
  available_years: number[];
}

export interface LegacyFilters {
  student_username?: string;
  student_name?: string;
  has_dues?: boolean;
  tc_number?: string;
  course?: string;
  caste?: string;
  batch?: string;
  year?: number;
  min_amount?: number;
  max_amount?: number;
}

export const getLegacyRecords = async (
  filters?: LegacyFilters
): Promise<LegacyRecord[]> => {
  try {
    const accessToken =
      localStorage.getItem("studentAccessToken") ||
      localStorage.getItem("staffAccessToken");
    if (!accessToken) {
      throw new Error("No access token found. Please log in again.");
    }

    const params = filters ? { ...filters } : {};
    const response = await api.get("/dues/legacy-academic-records/", {
      params,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return response.data;
  } catch (error) {
    if (isAxiosError(error)) {
      if (error.response?.status === 401) {
        localStorage.removeItem("studentAccessToken");
        localStorage.removeItem("staffAccessToken");
        throw new Error("Your session has expired. Please log in again.");
      } else if (error.response?.status === 403) {
        throw new Error("You don't have permission to view legacy records");
      }
    }
    throw error;
  }
};

export const getLegacyRecordsGrouped = async (
  filters?: LegacyFilters
): Promise<LegacyStudentGroup[]> => {
  try {
    const accessToken =
      localStorage.getItem("studentAccessToken") ||
      localStorage.getItem("staffAccessToken");
    if (!accessToken) {
      throw new Error("No access token found. Please log in again.");
    }

    const params = filters ? { ...filters } : {};
    const response = await api.get(
      "/dues/legacy-academic-records/grouped_by_student/",
      {
        params,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    if (isAxiosError(error)) {
      if (error.response?.status === 401) {
        localStorage.removeItem("studentAccessToken");
        localStorage.removeItem("staffAccessToken");
        throw new Error("Your session has expired. Please log in again.");
      } else if (error.response?.status === 403) {
        throw new Error("You don't have permission to view legacy records");
      }
    }
    throw error;
  }
};

export interface PaginatedLegacyResponse {
  results: LegacyStudentGroup[];
  count: number;
  total_pages: number;
  current_page: number;
  page_size: number;
  has_next: boolean;
  has_previous: boolean;
}

export const getLegacyRecordsPaginated = async (
  filters?: LegacyFilters,
  page: number = 1,
  pageSize: number = 50
): Promise<PaginatedLegacyResponse> => {
  try {
    const accessToken =
      localStorage.getItem("studentAccessToken") ||
      localStorage.getItem("staffAccessToken");
    if (!accessToken) {
      throw new Error("No access token found. Please log in again.");
    }

    const params = {
      ...(filters || {}),
      page,
      page_size: pageSize,
    };

    const response = await api.get(
      "/dues/legacy-academic-records/paginated_grouped/",
      {
        params,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    if (isAxiosError(error)) {
      if (error.response?.status === 401) {
        localStorage.removeItem("studentAccessToken");
        localStorage.removeItem("staffAccessToken");
        throw new Error("Your session has expired. Please log in again.");
      } else if (error.response?.status === 403) {
        throw new Error("You don't have permission to view legacy records");
      }
    }
    throw error;
  }
};

export const getLegacyStatistics = async (
  filters?: LegacyFilters
): Promise<LegacyStatistics> => {
  try {
    const accessToken =
      localStorage.getItem("studentAccessToken") ||
      localStorage.getItem("staffAccessToken");
    if (!accessToken) {
      throw new Error("No access token found. Please log in again.");
    }

    const params = filters ? { ...filters } : {};
    const response = await api.get(
      "/dues/legacy-academic-records/statistics/",
      {
        params,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    if (isAxiosError(error)) {
      if (error.response?.status === 401) {
        localStorage.removeItem("studentAccessToken");
        localStorage.removeItem("staffAccessToken");
        throw new Error("Your session has expired. Please log in again.");
      } else if (error.response?.status === 403) {
        throw new Error("You don't have permission to view legacy statistics");
      }
    }
    throw error;
  }
};

export const searchLegacyRecords = async (
  query: string
): Promise<LegacyRecord[]> => {
  try {
    const accessToken =
      localStorage.getItem("studentAccessToken") ||
      localStorage.getItem("staffAccessToken");
    if (!accessToken) {
      throw new Error("No access token found. Please log in again.");
    }

    const response = await api.get("/dues/legacy-academic-records/search/", {
      params: { q: query },
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return response.data;
  } catch (error) {
    if (isAxiosError(error)) {
      if (error.response?.status === 401) {
        localStorage.removeItem("studentAccessToken");
        localStorage.removeItem("staffAccessToken");
        throw new Error("Your session has expired. Please log in again.");
      } else if (error.response?.status === 403) {
        throw new Error("You don't have permission to search legacy records");
      }
    }
    throw error;
  }
};

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

    // For accountant department, return legacy academic records
    if (department === "accountant" || department === "accounts") {
      const response = await api.get("/dues/legacy-academic-records/", {
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
    }

    // For other departments, return empty array for now since we don't have generic dues endpoint
    console.log(
      `No specific endpoint for department: ${department}, returning empty array`
    );
    return [];
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
        const res = await api.post(`/auth/refresh/`, {
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
      localStorage.getItem("staffAccessToken") ||
      localStorage.getItem("studentAccessToken");
    if (!accessToken) {
      throw new Error("No access token found. Please log in again.");
    }

    const response = await api.get("/dues/hostel-records/", {
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
        throw new Error("You don't have permission to view hostel dues");
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
  try {
    const accessToken =
      localStorage.getItem("staffAccessToken") ||
      localStorage.getItem("studentAccessToken");
    const response = await api.patch(`/dues/hostel-records/${dueId}/`, data, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export interface Student {
  username: string; // This comes from user.username in the backend (roll number)
  name: string;
  course: string;
  caste: string;
  phone_number: string;
}

export const findStudentByUsername = async (
  username: string
): Promise<Student | undefined> => {
  try {
    const students = await searchStudentsByRollNumber(username);
    return students.find((s) => s.username === username);
  } catch (error) {
    console.error("Error finding student:", error);
    return undefined;
  }
};
