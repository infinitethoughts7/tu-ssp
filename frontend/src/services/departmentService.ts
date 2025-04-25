import axios from "axios";
import { API_BASE_URL } from "./api";
import { DepartmentDue } from "../types/department";

export const getDepartmentDues = async (
  department: string
): Promise<DepartmentDue[]> => {
  try {
    console.log(
      `[DepartmentService] Fetching dues for department: ${department}`
    );
    console.log(`[DepartmentService] API URL: ${API_BASE_URL}/dues/`);

    const response = await axios.get(`${API_BASE_URL}/dues/`, {
      params: {
        department: department.toLowerCase(),
      },
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
    });

    console.log(`[DepartmentService] Request URL:`, response.config.url);
    console.log(`[DepartmentService] Request Params:`, response.config.params);
    console.log(`[DepartmentService] Response Status:`, response.status);
    console.log(`[DepartmentService] Response Data:`, response.data);

    return response.data;
  } catch (error) {
    console.error(
      `[DepartmentService] Error fetching ${department} dues:`,
      error
    );
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || "Failed to fetch dues");
    }
    throw error;
  }
};

export const markDueAsPaid = async (dueId: number): Promise<void> => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/dues/${dueId}/mark_as_paid/`,
      {},
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error marking due as paid:", error);
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message || "Failed to mark due as paid"
      );
    }
    throw error;
  }
};
