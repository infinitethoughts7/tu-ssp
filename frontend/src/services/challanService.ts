import api from "./api";

export interface StudentProfile {
  roll_number: string;
  full_name: string;
  phone_number: string;
  caste?: string;
  course?: string;
}

export interface Challan {
  id: number;
  student: StudentProfile;
  department: "academic" | "hostel";
  image: string;
  amount: number;
  status: "pending" | "verified" | "rejected";
  uploaded_by: number | null;
  verified_by?: number | null;
  uploaded_at: string;
  verified_at?: string | null;
  remarks?: string;
}

export const uploadChallan = async (data: FormData): Promise<Challan> => {
  try {
    const response = await api.post("/dues/challans/", data);
    return response.data;
  } catch (error: any) {
    if (error.response) {
      console.error("Backend error:", error.response.data);
      throw new Error(JSON.stringify(error.response.data));
    }
    throw error;
  }
};

export const getChallans = async (
  role: "staff" | "student" = "student"
): Promise<Challan[]> => {
  const accessToken = localStorage.getItem(
    role === "staff" ? "staffAccessToken" : "studentAccessToken"
  );
  const response = await api.get("/dues/challans/", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  return response.data;
};

export const verifyChallan = async (
  id: number,
  status: "verified" | "rejected",
  remarks?: string
): Promise<Challan> => {
  const accessToken =
    localStorage.getItem("staffAccessToken") ||
    localStorage.getItem("studentAccessToken");
  console.log("verifyChallan: Using token:", accessToken);
  console.log("verifyChallan: PATCH", `/dues/challans/${id}/`, {
    status,
    remarks,
  });
  const response = await api.patch(
    `/dues/challans/${id}/`,
    {
      status,
      remarks,
    },
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );
  return response.data;
};
