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
  ChevronDown,
  ChevronRight,
  LogOut,
  IndianRupee,
  Calendar,
  CheckCircle2,
  Clock,
  School,
} from "lucide-react";
import { format } from "date-fns";
import { DepartmentDue } from "../types/department";
import axios from "axios";
import { cn } from "../lib/utils";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";

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
  roll_numbers: string[];
  name: string;
  course: string;
  caste: string;
  phone_number: string;
  dues: DepartmentDue[];
  totalAmount: number;
  unpaidAmount: number;
  user?: {
    id: number;
    email: string | null;
    roll_number: string;
    is_student: boolean;
    is_staff: boolean;
    first_name?: string;
    last_name?: string;
  };
}

interface StudentSuggestion {
  roll_numbers: string[];
  name: string;
  course: string;
  caste: string;
  phone_number: string;
  user?: {
    id: number;
    email: string | null;
    roll_number: string;
    is_student: boolean;
    is_staff: boolean;
    first_name?: string;
    last_name?: string;
  };
}

interface StudentResponse {
  roll_numbers: string[];
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
  const [selectedCourse, setSelectedCourse] = useState<string>("all");
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
  const [selectedStudent, setSelectedStudent] = useState<StudentDetails | null>(
    null
  );
  const [showStudentDetails, setShowStudentDetails] = useState(false);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

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
          console.log("Fetched dues:", dues);
          setDepartmentDues(dues);
          setError(null);
        } catch (err) {
          console.error("Error fetching dues:", err);
          setError("Failed to fetch department dues. Please try again later.");
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
        searchTerm === "" ||
        due.student_details.user.roll_number
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        due.student_details.course
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
      const matchesPaidFilter =
        filterPaid === null || due.is_paid === filterPaid;
      const matchesCourseFilter =
        selectedCourse === "all" ||
        due.student_details.course === selectedCourse;
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
          roll_numbers: [student.roll_number],
          name: student.name,
          course: student.course,
          caste: student.caste,
          phone_number: student.phone_number,
          user: student.user,
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
    setNewDue({ ...newDue, student_roll_number: suggestion.roll_numbers[0] });
    setShowSuggestions(false);

    try {
      const response = await searchStudentsByRollNumber(
        suggestion.roll_numbers[0]
      );
      if (response && response.length > 0) {
        const student = response[0];
        // Add null checks for user and name properties
        const firstName = student.user?.first_name || "";
        const lastName = student.user?.last_name || "";
        const fullName =
          `${firstName} ${lastName}`.trim() || student.name || "N/A";

        setStudentDetails({
          roll_numbers: [student.roll_number],
          name: fullName,
          course: student.course || "N/A",
          caste: student.caste || "N/A",
          phone_number: student.phone_number || "N/A",
          dues: [],
          totalAmount: 0,
          unpaidAmount: 0,
          user: student.user || {
            id: 0,
            email: null,
            roll_number: student.roll_number,
            is_student: true,
            is_staff: false,
          },
        });
        setSelectedCaste(student.caste || "");
      }
    } catch (error) {
      console.error("Error fetching student details:", error);
      setError("Error fetching student details. Please try again.");
      setStudentDetails(null);
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
        student: studentDetails.roll_numbers[0],
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

  // Function to handle student selection
  const handleStudentSelect = (student: StudentDetails) => {
    setSelectedStudent(student);
    setShowStudentDetails(true);
  };

  // Function to group dues by student
  const groupDuesByStudent = (dues: DepartmentDue[]) => {
    const grouped = dues.reduce((acc, due) => {
      const key = due.student_details.user.roll_number;

      if (!acc[key]) {
        acc[key] = {
          roll_numbers: [due.student_details.user.roll_number],
          name: `${due.student_details.user.first_name} ${due.student_details.user.last_name}`,
          course: due.student_details.course,
          caste: due.student_details.caste,
          phone_number: due.student_details.phone_number,
          dues: [],
          totalAmount: 0,
          unpaidAmount: 0,
          user: due.student_details.user,
        };
      }

      acc[key].dues.push(due);
      const amount = parseFloat(due.amount);
      acc[key].totalAmount += amount;
      if (!due.is_paid) {
        acc[key].unpaidAmount += amount;
      }

      return acc;
    }, {} as Record<string, StudentDetails>);

    return Object.values(grouped);
  };

  const studentGroups = groupDuesByStudent(filteredDues);

  if (!accessToken) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-4">
            <div className="bg-gradient-to-br from-blue-600 to-purple-600 p-3 rounded-xl shadow-md">
              {getDepartmentIcon()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-bold text-gray-900">
                  {getDepartmentTitle()}
                </h1>
              </div>
              {staffProfile && (
                <div className="flex items-center space-x-2 text-sm text-gray-600 mt-1">
                  <Briefcase className="h-4 w-4 text-blue-500" />
                  <span>{staffProfile.designation}</span>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Button
              onClick={() => setShowAddDueModal(true)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-md"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Due
            </Button>
            <Button
              variant="outline"
              onClick={logout}
              className="hover:bg-red-50 hover:text-red-600 hover:border-red-200"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        {error && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="p-4 flex items-center text-red-700">
              <AlertCircle className="h-5 w-5 mr-2" />
              {error}
            </CardContent>
          </Card>
        )}

        {/* Staff Profile Card */}
        {staffProfile ? (
          <Card className="mb-6 border-none shadow-lg bg-gradient-to-br from-white to-blue-50">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="flex items-center space-x-3">
                  <div className="bg-gradient-to-br from-blue-500 to-purple-500 p-3 rounded-full shadow-md">
                    <User className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Name</p>
                    <p className="font-medium text-gray-800">
                      {staffProfile.name}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="bg-gradient-to-br from-green-500 to-emerald-500 p-3 rounded-full shadow-md">
                    <Mail className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium text-gray-800">
                      {staffProfile.email}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-3 rounded-full shadow-md">
                    <Phone className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="font-medium text-gray-800">
                      {staffProfile.phone_number}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="bg-gradient-to-br from-yellow-500 to-orange-500 p-3 rounded-full shadow-md">
                    <Briefcase className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Department</p>
                    <p className="font-medium text-gray-800">
                      {staffProfile.department}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="mb-6 border-none shadow-lg bg-gradient-to-br from-white to-blue-50">
            <CardContent className="p-6">
              <div className="flex justify-center items-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                <span className="ml-2 text-gray-600">
                  Loading staff profile...
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Combined Filters and Dues Card */}
        <Card className="border-none shadow-lg bg-white">
          <CardContent className="p-6">
            {/* Search and Filters */}
            <div className="mb-6 pb-6 border-b border-gray-100">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-600" />
                  <Input
                    type="text"
                    placeholder="Search by roll number..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-white border-gray-200 focus:border-black focus:ring-black"
                  />
                </div>
                <Select
                  value={selectedCourse}
                  onValueChange={setSelectedCourse}
                >
                  <SelectTrigger className="bg-white border-gray-200 focus:border-black focus:ring-black">
                    <SelectValue placeholder="All Courses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Courses</SelectItem>
                    {COURSE_OPTIONS.map((course) => (
                      <SelectItem key={course} value={course}>
                        {course}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex items-center space-x-4">
                  <Button
                    variant={filterPaid === null ? "default" : "outline"}
                    onClick={() => setFilterPaid(null)}
                    className={cn(
                      filterPaid === null
                        ? "bg-black text-white hover:bg-gray-800"
                        : "border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-gray-900 hover:border-gray-300"
                    )}
                  >
                    All
                  </Button>
                  <Button
                    variant={filterPaid === false ? "default" : "outline"}
                    onClick={() => setFilterPaid(false)}
                    className={cn(
                      filterPaid === false
                        ? "bg-black text-white hover:bg-gray-800"
                        : "border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-gray-900 hover:border-gray-300"
                    )}
                  >
                    Unpaid
                  </Button>
                  <Button
                    variant={filterPaid === true ? "default" : "outline"}
                    onClick={() => setFilterPaid(true)}
                    className={cn(
                      filterPaid === true
                        ? "bg-black text-white hover:bg-gray-800"
                        : "border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-gray-900 hover:border-gray-300"
                    )}
                  >
                    Paid
                  </Button>
                </div>
              </div>
            </div>

            {/* Dues Table */}
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-gray-600" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="w-8"></TableHead>
                      <TableHead>Student Details</TableHead>
                      <TableHead>Course Info</TableHead>
                      <TableHead>Dues Summary</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {studentGroups.map((group) => (
                      <>
                        <TableRow key={group.name} className="hover:bg-gray-50">
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                const newExpandedRows = new Set(expandedRows);
                                if (
                                  newExpandedRows.has(group.roll_numbers[0])
                                ) {
                                  newExpandedRows.delete(group.roll_numbers[0]);
                                } else {
                                  newExpandedRows.add(group.roll_numbers[0]);
                                }
                                setExpandedRows(newExpandedRows);
                              }}
                            >
                              {expandedRows.has(group.roll_numbers[0]) ? (
                                <ChevronDown className="h-5 w-5 text-gray-600" />
                              ) : (
                                <ChevronRight className="h-5 w-5 text-gray-600" />
                              )}
                            </Button>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div className="font-medium text-blue-600 mb-1">
                                {group.roll_numbers[0]}
                              </div>
                              <Button
                                variant="link"
                                onClick={() => handleStudentSelect(group)}
                                className="font-medium text-gray-900 hover:text-gray-700 p-0 h-auto"
                              >
                                {group.name}
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div className="text-gray-900">
                                {group.course}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div className="flex items-center gap-2 font-medium text-gray-900">
                                <IndianRupee className="h-4 w-4 text-blue-500" />
                                Total: ₹{group.totalAmount.toFixed(2)}
                              </div>
                              <div className="flex items-center gap-2 text-red-600 mt-1">
                                <AlertCircle className="h-4 w-4" />
                                Unpaid: ₹{group.unpaidAmount.toFixed(2)}
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                        {expandedRows.has(group.roll_numbers[0]) && (
                          <TableRow>
                            <TableCell colSpan={4} className="p-0">
                              <div className="bg-gray-50 p-4">
                                <Table>
                                  <TableHeader>
                                    <TableRow className="bg-gray-100">
                                      <TableHead>Due Date</TableHead>
                                      <TableHead>Description</TableHead>
                                      <TableHead>Amount</TableHead>
                                      <TableHead>Status</TableHead>
                                      <TableHead>Actions</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {group.dues.map((due) => (
                                      <TableRow
                                        key={due.id}
                                        className="hover:bg-gray-50"
                                      >
                                        <TableCell>
                                          <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-gray-600" />
                                            {format(
                                              new Date(due.due_date),
                                              "dd MMM yyyy"
                                            )}
                                          </div>
                                        </TableCell>
                                        <TableCell>{due.description}</TableCell>
                                        <TableCell>
                                          <div className="flex items-center gap-2">
                                            <IndianRupee className="h-4 w-4 text-gray-600" />
                                            {due.amount}
                                          </div>
                                        </TableCell>
                                        <TableCell>
                                          <Badge
                                            variant={
                                              due.is_paid
                                                ? "default"
                                                : "destructive"
                                            }
                                            className={
                                              due.is_paid
                                                ? "bg-gray-100 text-gray-700 hover:bg-gray-100"
                                                : ""
                                            }
                                          >
                                            {due.is_paid ? (
                                              <CheckCircle2 className="h-3 w-3 mr-1" />
                                            ) : (
                                              <AlertCircle className="h-3 w-3 mr-1" />
                                            )}
                                            {due.is_paid ? "Paid" : "Unpaid"}
                                          </Badge>
                                        </TableCell>
                                        <TableCell>
                                          {!due.is_paid && (
                                            <Button
                                              variant="outline"
                                              size="sm"
                                              onClick={async () => {
                                                try {
                                                  await markDueAsPaid(due.id);
                                                  setDepartmentDues(
                                                    (prevDues) =>
                                                      prevDues.map((d) =>
                                                        d.id === due.id
                                                          ? {
                                                              ...d,
                                                              is_paid: true,
                                                            }
                                                          : d
                                                      )
                                                  );
                                                  setError(null);
                                                } catch (error) {
                                                  console.error(
                                                    "Error marking due as paid:",
                                                    error
                                                  );
                                                  setError(
                                                    "Failed to mark due as paid. Please try again."
                                                  );
                                                }
                                              }}
                                              className="border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-gray-900 hover:border-gray-300"
                                            >
                                              Mark as Paid
                                            </Button>
                                          )}
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Add Due Modal */}
        <Dialog open={showAddDueModal} onOpenChange={setShowAddDueModal}>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Due</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {/* Roll Number Search with Autocomplete */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Roll Number
                </label>
                <div className="relative w-full">
                  <Input
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
                    className="w-full"
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
                  <div className="absolute z-10 w-full mt-1 bg-white rounded-md shadow-lg border border-gray-200">
                    {studentSuggestions.map((student) => (
                      <div
                        key={student.roll_numbers[0]}
                        className="px-4 py-2 cursor-pointer hover:bg-gray-50"
                        onClick={() => handleSuggestionSelect(student)}
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-medium">
                            {student.roll_numbers[0]}
                          </span>
                          <span className="text-gray-600">{student.name}</span>
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

              {/* Student Details */}
              {studentDetails && (
                <Card className="bg-gray-50">
                  <CardContent className="p-4">
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
                  </CardContent>
                </Card>
              )}

              {/* Due Details */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Amount
                  </label>
                  <Input
                    type="number"
                    value={newDue.amount}
                    onChange={(e) =>
                      setNewDue({ ...newDue, amount: e.target.value })
                    }
                    placeholder="Enter amount"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Due Date
                  </label>
                  <Input
                    type="date"
                    value={newDue.due_date}
                    onChange={(e) =>
                      setNewDue({ ...newDue, due_date: e.target.value })
                    }
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
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter description"
                  rows={3}
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <Button
                variant="outline"
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
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddDue}
                disabled={!studentDetails}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
              >
                Add Due
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Student Details Modal */}
        <Dialog open={showStudentDetails} onOpenChange={setShowStudentDetails}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Student Details</DialogTitle>
            </DialogHeader>
            {selectedStudent && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Name</p>
                    <p className="font-medium">{selectedStudent.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Roll Number</p>
                    <p className="font-medium">
                      {selectedStudent.roll_numbers[0]}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Course</p>
                    <p className="font-medium">{selectedStudent.course}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Caste</p>
                    <p className="font-medium">{selectedStudent.caste}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Phone Number</p>
                    <p className="font-medium">
                      {selectedStudent.phone_number}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Department</p>
                    <p className="font-medium">
                      {selectedStudent.dues[0]?.department_details.department}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default StaffDashboard;
