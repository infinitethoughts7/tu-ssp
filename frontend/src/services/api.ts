export const API_BASE_URL = "http://localhost:8000/api";

export const fetchDues = async (token: string) => {
  try {
    console.log(
      "Fetching dues with token:",
      token ? "Token present" : "No token"
    );

    const response = await fetch(`${API_BASE_URL}/dues/`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    console.log("API Response Status:", response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Dues API Error Response:", {
        status: response.status,
        statusText: response.statusText,
        data: errorData,
      });

      if (response.status === 401) {
        throw new Error("Authentication failed. Please login again.");
      }
      throw new Error(errorData.detail || "Failed to fetch dues");
    }

    const data = await response.json();
    console.log("Successfully fetched dues:", data);
    return data;
  } catch (error) {
    console.error("Error fetching dues:", error);
    throw error;
  }
};
