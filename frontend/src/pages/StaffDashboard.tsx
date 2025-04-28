import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import {
  getDepartmentDues,
  markDueAsPaid,
  addDepartmentDue,
  getStaffProfile,
  StaffProfile,
  searchStudentsByRollNumber,
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
  Plus,
  X,
  User,
  Phone,
  Mail,
  Briefcase,
} from "lucide-react";
import { format } from "date-fns";
import { DepartmentDue } from "../types/department";
import axios from "axios";

// Course options from models.py
const COURSE_OPTIONS = [
  "M.A English",
  "M.A Hindi",
  "M.A Mass Communication",
  "M.A Telugu Studies",
  "M.A Urdu",
  "M.A Applied Economics (5 Years Integrated)",
  "M.S.W Social Work",
  "M.Com Commerce",
  "M.Sc Applied Statistics",
  "M.Sc Biotechnology",
  "M.Sc Botany",
  "M.Sc Geo-Informatics",
  "M.Sc Organic Chemistry",
  "M.Sc Pharmaceutical Chemistry (5 Years Integrated)",
  "M.Sc Physics with Electronics",
  "M.B.A Business Management",
  "M.C.A Computer Science & Engineering",
  "L.L.B Law",
  "L.L.M Law",
  "M.A Economics",
  "M.Sc Mathematics",
  "M.A Public Administration",
  "M.Sc Pharmaceutical Chemistry",
  "I.M.B.A Business Management (5 Years Integrated)",
  "M.Ed",
  "B.Ed",
];

interface StudentDetails {
  roll_number: string;
  name: string;
  course: string;
  caste: string;
  phone_number: string;
}

interface StudentSuggestion {
  roll_number: string;
  name: string;
  course: string;
  caste: string;
  phone_number: string;
}

interface StudentResponse {
  roll_number: string;
  user: {
    first_name: string;
    last_name: string;
  };
  course: string;
  caste: string;
  phone_number: string;
}

const StaffDashboard = () => {
  const { logout, accessToken } = useAuth();
  const navigate = useNavigate();
  const { department: urlDepartment } = useParams();
  const [departmentDues, setDepartmentDues] = useState<DepartmentDue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPaid, setFilterPaid] = useState<boolean | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [sortField, setSortField] = useState<keyof DepartmentDue>("due_date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [showAddDueModal, setShowAddDueModal] = useState(false);
  const [newDue, setNewDue] = useState({
    student_roll_number: "",
    amount: "",
    due_date: "",
    description: "",
  });
  const [studentDetails, setStudentDetails] = useState<StudentDetails | null>(
    null
  );
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [staffProfile, setStaffProfile] = useState<StaffProfile | null>(null);
  const [studentSuggestions, setStudentSuggestions] = useState<
    StudentSuggestion[]
  >([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedCaste, setSelectedCaste] = useState<string>("");

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

  useEffect(() => {
    const fetchStaffProfile = async () => {
      try {
        console.log("Starting to fetch staff profile...");
        const profile = await getStaffProfile();
        console.log("Staff profile fetched successfully:", profile);
        setStaffProfile(profile);
        setError(null);
      } catch (error) {
        console.error("Error in fetchStaffProfile:", error);
        if (axios.isAxiosError(error)) {
          if (error.response?.status === 403) {
            setError("You do not have permission to view this profile");
          } else if (error.response?.status === 401) {
            setError("Please log in again");
            logout();
          } else {
            setError(
              `Failed to load staff profile: ${
                error.response?.data?.error || error.message
              }`
            );
          }
        } else {
          setError("An unexpected error occurred while loading the profile");
        }
      }
    };

    if (accessToken) {
      console.log("Access token exists, fetching profile");
      fetchStaffProfile();
    } else {
      console.log("No access token, skipping profile fetch");
      setError("Please log in to view your profile");
    }
  }, [accessToken, logout]);

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
        return "Students Library Dues";
      case "hostel":
        return "Students Hostel Dues";
      case "accounts":
        return "Students Accounts Dues";
      case "sports":
        return "Students Sports Dues";
      case "lab":
        return "Students Lab Dues";
      default:
        return "Students Department Dues";
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
      const matchesCourseFilter =
        !selectedCourse || due.student_details.course === selectedCourse;
      return matchesSearch && matchesPaidFilter && matchesCourseFilter;
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

  // Function to handle roll number search with suggestions
  const handleRollNumberSearch = async (value: string) => {
    if (value.length < 3) {
      setStudentSuggestions([]);
      return;
    }

    setIsSearching(true);
    setSearchError(null);
    try {
      const results = await searchStudentsByRollNumber(value);
      setStudentSuggestions(
        results.map((student) => ({
          roll_number: student.roll_number,
          name: student.name,
          course: student.course,
          caste: student.caste,
          phone_number: student.phone_number,
        }))
      );
    } catch (error) {
      console.error("Error searching student:", error);
      setSearchError("Error searching for student");
    } finally {
      setIsSearching(false);
    }
  };

  // Function to handle suggestion selection
  const handleSuggestionSelect = async (suggestion: StudentSuggestion) => {
    setNewDue({ ...newDue, student_roll_number: suggestion.roll_number });
    setShowSuggestions(false);

    try {
      const response = await searchStudentsByRollNumber(suggestion.roll_number);
      if (response && response.length > 0) {
        const student = response[0];
        setStudentDetails({
          roll_number: student.roll_number,
          name: `${student.user.first_name} ${student.user.last_name}`,
          course: student.course,
          caste: student.caste,
          phone_number: student.phone_number,
        });
        setSelectedCaste(student.caste);
      }
    } catch (error) {
      console.error("Error fetching student details:", error);
      setError("Error fetching student details");
    }
  };

  // Function to handle adding new due
  const handleAddDue = async () => {
    if (!studentDetails) {
      setError("Please select a student first");
      return;
    }

    try {
      const department = localStorage.getItem("department");
      if (!department) {
        setError("Department not found");
        return;
      }

      // Convert amount to decimal string
      const amount = parseFloat(newDue.amount).toFixed(2);

      const dueData = {
        student: studentDetails.roll_number,
        amount: amount,
        due_date: newDue.due_date,
        description: newDue.description,
        department: department,
      };

      console.log("Sending due data:", JSON.stringify(dueData, null, 2));
      console.log("Student details:", JSON.stringify(studentDetails, null, 2));
      console.log("Department:", department);

      const response = await addDepartmentDue(dueData);
      console.log("Response from backend:", response);

      setShowAddDueModal(false);
      setNewDue({
        student_roll_number: "",
        amount: "",
        due_date: "",
        description: "",
      });
      setStudentDetails(null);

      // Refresh the dues list
      const updatedDues = await getDepartmentDues(department);
      setDepartmentDues(updatedDues);
    } catch (error: any) {
      console.error("Error adding due:", error);
      if (axios.isAxiosError(error)) {
        console.error("Error details:", {
          status: error.response?.status,
          data: error.response?.data,
          headers: error.response?.headers,
          config: error.config,
        });
        setError(
          `Failed to add due: ${error.response?.data?.error || error.message}`
        );
      } else {
        setError("Failed to add due. Please try again.");
      }
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
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {getDepartmentTitle()}
              </h1>
              {staffProfile && (
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Briefcase className="h-4 w-4" />
                  <span>{staffProfile.designation}</span>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowAddDueModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Add Due</span>
            </button>
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

        {staffProfile ? (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="flex items-center space-x-3">
                <div className="bg-blue-100 p-3 rounded-full">
                  <User className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Name</p>
                  <p className="font-medium">{staffProfile.name}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="bg-green-100 p-3 rounded-full">
                  <Mail className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{staffProfile.email}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="bg-purple-100 p-3 rounded-full">
                  <Phone className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-medium">{staffProfile.phone_number}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="bg-yellow-100 p-3 rounded-full">
                  <Briefcase className="h-6 w-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Department</p>
                  <p className="font-medium">{staffProfile.department}</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex justify-center items-center">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              <span className="ml-2 text-gray-600">
                Loading staff profile...
              </span>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-2">
              <Search className="h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by roll number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
              />
            </div>
            <div className="flex items-center space-x-2">
              <GraduationCap className="h-5 w-5 text-gray-400" />
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
              >
                <option value="">All Courses</option>
                {COURSE_OPTIONS.map((course) => (
                  <option key={course} value={course}>
                    {course}
                  </option>
                ))}
              </select>
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
        </div>

        <div className="bg-white rounded-lg shadow p-6">
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

        {/* Add Due Modal */}
        {showAddDueModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Add New Due</h2>
                <button
                  onClick={() => {
                    setShowAddDueModal(false);
                    setStudentDetails(null);
                    setNewDue({
                      student_roll_number: "",
                      amount: "",
                      due_date: "",
                      description: "",
                    });
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Roll Number Search with Autocomplete */}
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Roll Number
                  </label>
                  <div className="relative w-full">
                    <input
                      type="text"
                      value={newDue.student_roll_number}
                      onChange={(e) => {
                        const value = e.target.value;
                        setNewDue((prev) => ({
                          ...prev,
                          student_roll_number: value,
                        }));
                        handleRollNumberSearch(value);
                      }}
                      onFocus={() => setShowSuggestions(true)}
                      className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter roll number"
                    />
                    {isSearching && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <Loader2 className="h-5 w-5 animate-spin" />
                      </div>
                    )}
                  </div>

                  {/* Suggestions Dropdown */}
                  {showSuggestions && studentSuggestions.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white rounded-md shadow-lg">
                      {studentSuggestions.map((student) => (
                        <div
                          key={student.roll_number}
                          className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                          onClick={() => {
                            setNewDue((prev) => ({
                              ...prev,
                              student_roll_number: student.roll_number,
                            }));
                            setStudentDetails({
                              roll_number: student.roll_number,
                              name: student.name,
                              course: student.course,
                              caste: student.caste,
                              phone_number: student.phone_number,
                            });
                            setShowSuggestions(false);
                          }}
                        >
                          <div className="flex justify-between items-center">
                            <span className="font-medium">
                              {student.roll_number}
                            </span>
                            <span className="text-gray-600">
                              {student.name}
                            </span>
                          </div>
                          <div className="text-sm text-gray-500">
                            {student.course} • {student.caste}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {searchError && (
                    <p className="mt-1 text-sm text-red-600">{searchError}</p>
                  )}
                </div>

                {/* Student Details (Auto-filled) */}
                {studentDetails && (
                  <div className="bg-gray-50 p-4 rounded-md">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">
                      Student Details
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Name</p>
                        <p className="font-medium">{studentDetails.name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Course</p>
                        <p className="font-medium">{studentDetails.course}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Caste</p>
                        <p className="font-medium">{studentDetails.caste}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Phone</p>
                        <p className="font-medium">
                          {studentDetails.phone_number}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Due Details */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Amount
                    </label>
                    <input
                      type="number"
                      value={newDue.amount}
                      onChange={(e) =>
                        setNewDue({ ...newDue, amount: e.target.value })
                      }
                      className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter amount"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Due Date
                    </label>
                    <input
                      type="date"
                      value={newDue.due_date}
                      onChange={(e) =>
                        setNewDue({ ...newDue, due_date: e.target.value })
                      }
                      className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={newDue.description}
                    onChange={(e) =>
                      setNewDue({ ...newDue, description: e.target.value })
                    }
                    className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter description"
                    rows={3}
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowAddDueModal(false);
                    setStudentDetails(null);
                    setNewDue({
                      student_roll_number: "",
                      amount: "",
                      due_date: "",
                      description: "",
                    });
                  }}
                  className="px-4 py-2 border rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddDue}
                  disabled={!studentDetails}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300"
                >
                  Add Due
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StaffDashboard;
