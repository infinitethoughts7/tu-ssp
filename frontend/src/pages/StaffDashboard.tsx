import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import {
  getDepartmentDues,
  markDueAsPaid,
} from "../services/departmentService";
import {
  Loader2,
  AlertCircle,
  BookOpen,
  Home,
  GraduationCap,
  Trophy,
  Beaker,
  Search,
  ArrowUpDown,
} from "lucide-react";
import { format } from "date-fns";
import { DepartmentDue } from "../types/department";

const StaffDashboard = () => {
  const { logout, accessToken } = useAuth();
  const navigate = useNavigate();
  const { department: urlDepartment } = useParams();
  const [departmentDues, setDepartmentDues] = useState<DepartmentDue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPaid, setFilterPaid] = useState<boolean | null>(null);
  const [sortField, setSortField] = useState<keyof DepartmentDue>("due_date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  useEffect(() => {
    console.log("StaffDashboard - Checking auth state:", {
      hasAccessToken: !!accessToken,
      urlDepartment,
      storedDepartment: localStorage.getItem("department"),
    });

    if (!accessToken) {
      console.log("No access token found, redirecting to login");
      navigate("/staff-login");
      return;
    }

    const storedDepartment = localStorage.getItem("department");
    if (!storedDepartment) {
      console.log("No department found in localStorage");
      navigate("/staff-login");
      return;
    }

    // If URL department doesn't match stored department, redirect
    if (
      urlDepartment &&
      urlDepartment.toLowerCase() !== storedDepartment.toLowerCase()
    ) {
      console.log(`Redirecting to correct department: ${storedDepartment}`);
      navigate(`/dashboard/${storedDepartment.toLowerCase()}`, {
        replace: true,
      });
    }
  }, [accessToken, urlDepartment, navigate]);

  useEffect(() => {
    const fetchDepartmentDues = async () => {
      const department = localStorage.getItem("department");
      if (department && accessToken) {
        try {
          setLoading(true);
          const dues = await getDepartmentDues(department);
          setDepartmentDues(dues);
        } catch (err) {
          setError("Failed to fetch department dues. Please try again later.");
          console.error(err);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchDepartmentDues();
  }, [accessToken]);

  const handleMarkAsPaid = async (dueId: number) => {
    try {
      await markDueAsPaid(dueId);
      // Refresh the dues list
      const department = localStorage.getItem("department");
      if (department) {
        const updatedDues = await getDepartmentDues(department);
        setDepartmentDues(updatedDues);
      }
    } catch (error) {
      console.error("Error marking due as paid:", error);
      setError("Failed to mark due as paid. Please try again.");
    }
  };

  const getDepartmentIcon = () => {
    const department = localStorage.getItem("department")?.toLowerCase();
    switch (department) {
      case "library":
        return <BookOpen className="h-6 w-6 text-blue-600" />;
      case "hostel":
        return <Home className="h-6 w-6 text-green-600" />;
      case "accounts":
        return <GraduationCap className="h-6 w-6 text-purple-600" />;
      case "sports":
        return <Trophy className="h-6 w-6 text-yellow-600" />;
      case "lab":
        return <Beaker className="h-6 w-6 text-red-600" />;
      default:
        return null;
    }
  };

  const getDepartmentTitle = () => {
    const department = localStorage.getItem("department")?.toLowerCase();
    switch (department) {
      case "library":
        return "Library Dues";
      case "hostel":
        return "Hostel Dues";
      case "accounts":
        return "Accounts Dues";
      case "sports":
        return "Sports Dues";
      case "lab":
        return "Lab Dues";
      default:
        return "Department Dues";
    }
  };

  const filteredDues = departmentDues
    .filter((due) => {
      const matchesSearch =
        due.student_details.user.roll_number
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        due.student_details.course
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
      const matchesPaidFilter =
        filterPaid === null || due.is_paid === filterPaid;
      return matchesSearch && matchesPaidFilter;
    })
    .sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      const direction = sortDirection === "asc" ? 1 : -1;

      if (typeof aValue === "string" && typeof bValue === "string") {
        return direction * aValue.localeCompare(bValue);
      }
      if (typeof aValue === "number" && typeof bValue === "number") {
        return direction * (aValue - bValue);
      }
      return 0;
    });

  const handleSort = (field: keyof DepartmentDue) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  if (!accessToken) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-3">
            {getDepartmentIcon()}
            <h1 className="text-2xl font-bold text-gray-900">
              {getDepartmentTitle()}
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={logout}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-md flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            {error}
          </div>
        )}

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex flex-col md:flex-row justify-between items-center mb-6 space-y-4 md:space-y-0">
            <div className="flex items-center space-x-2">
              <Search className="h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by roll number or course..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setFilterPaid(null)}
                className={`px-4 py-2 rounded-md ${
                  filterPaid === null
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-700"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterPaid(false)}
                className={`px-4 py-2 rounded-md ${
                  filterPaid === false
                    ? "bg-red-600 text-white"
                    : "bg-gray-200 text-gray-700"
                }`}
              >
                Unpaid
              </button>
              <button
                onClick={() => setFilterPaid(true)}
                className={`px-4 py-2 rounded-md ${
                  filterPaid === true
                    ? "bg-green-600 text-white"
                    : "bg-gray-200 text-gray-700"
                }`}
              >
                Paid
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort("student_details")}
                    >
                      <div className="flex items-center">
                        Student
                        <ArrowUpDown className="h-4 w-4 ml-1" />
                      </div>
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort("amount")}
                    >
                      <div className="flex items-center">
                        Amount
                        <ArrowUpDown className="h-4 w-4 ml-1" />
                      </div>
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort("due_date")}
                    >
                      <div className="flex items-center">
                        Due Date
                        <ArrowUpDown className="h-4 w-4 ml-1" />
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredDues.map((due) => (
                    <tr key={due.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {due.student_details.user.roll_number}
                        </div>
                        <div className="text-sm text-gray-500">
                          {due.student_details.course}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          ₹{due.amount}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {format(new Date(due.due_date), "dd MMM yyyy")}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {due.description}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {due.is_paid ? (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            Paid
                          </span>
                        ) : (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                            Unpaid
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {!due.is_paid && (
                          <button
                            onClick={() => handleMarkAsPaid(due.id)}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            Mark as Paid
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StaffDashboard;
