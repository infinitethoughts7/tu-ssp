export const API_BASE_URL = "http://localhost:8000/api";

export const fetchDues = async (token: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/dues/`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) {
      throw new Error("Failed to fetch dues");
    }
    const data = await response.json();
    localStorage.setItem("studentDues", JSON.stringify(data));
    return data;
  } catch (error) {
    console.error("Error fetching dues:", error);
    throw error;
  }
};
