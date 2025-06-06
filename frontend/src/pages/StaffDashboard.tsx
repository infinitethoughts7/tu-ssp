import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import {
  getDepartmentDues,
  markDueAsPaid,
  addDepartmentDue,
  getStaffProfile,
  StaffProfile,
  searchStudentsByRollNumber,
  getAcademicDues,
  updateAcademicDue,
  getHostelDues,
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
  Plus,
  User,
  Phone,
  Mail,
  Briefcase,
  ChevronDown,
  ChevronRight,
  LogOut,
  IndianRupee,
  Calendar,
  Receipt,
  CheckCircle2,
  XCircle,
  MessageSquare,
} from "lucide-react";
import { format } from "date-fns";
import { DepartmentDue } from "../types/department";
import axios from "axios";
import { cn } from "../lib/utils";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Input } from "../components/ui/input";
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
  DialogDescription,
} from "../components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import type {
  StudentDetails,
  StudentSuggestion,
  AcademicDue,
  DepartmentStudentGroup,
  AcademicStudentGroup,
} from "../types/staffDashboardTypes";
import { COURSE_OPTIONS } from "../types/constants";
import {
  getChallans,
  verifyChallan,
  Challan,
} from "../services/challanService";

interface StudentProfile {
  id?: number;
  full_name?: string;
  roll_number?: string;
  roll_numbers?: string[];
  caste?: string;
  phone_number?: string;
  name?: string;
}

interface HostelDue {
  id: number;
  student: number;
  student_name: string;
  student_roll: string;
  student_caste: string;
  student_phone: string;
  year_of_study: string;
  mess_bill: number;
  scholarship: number;
  deposit: number;
  remarks: string;
}



export default function StaffDashboard() {
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
  const [staffProfile, setStaffProfile] = useState<StaffProfile | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<StudentDetails | null>(
    null
  );
  const [showStudentDetails, setShowStudentDetails] = useState(false);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [academicDues, setAcademicDues] = useState<AcademicDue[]>([]);
  const [showAcademicDues, setShowAcademicDues] = useState(false);
  const [showUpdateDueModal, setShowUpdateDueModal] = useState(false);
  const [dueToUpdate, setDueToUpdate] = useState<AcademicDue | null>(null);
  const [isUpdatingDue, setIsUpdatingDue] = useState(false);
  const [hostelDues, setHostelDues] = useState<HostelDue[]>([]);
  const [challans, setChallans] = useState<Challan[]>([]);
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
  const [selectedChallan, setSelectedChallan] = useState<Challan | null>(null);
  const [searchRoll, setSearchRoll] = useState("");
  const [searchedStudent, setSearchedStudent] = useState<StudentProfile | null>(
    null
  );
  const [studentChallans, setStudentChallans] = useState<Challan[]>([]);
  const [isSearchingChallans, setIsSearchingChallans] = useState(false);
  const [showChallanModal, setShowChallanModal] = useState(false);
  const [selectedStudentChallans, setSelectedStudentChallans] = useState<
    Challan[]
  >([]);
  const [selectedStudentForChallans, setSelectedStudentForChallans] =
    useState<StudentProfile | null>(null);
  const [challanRemarks, setChallanRemarks] = useState<{
    [key: number]: string;
  }>({});
  const [isUpdatingChallan, setIsUpdatingChallan] = useState<{
    [key: number]: boolean;
  }>({});

  // Function to group dues by student
  const groupDuesByStudent = (dues: DepartmentDue[]) => {
    if (!Array.isArray(dues)) {
      console.error("Invalid dues data:", dues);
      return [];
    }

    const grouped = dues.reduce((acc, due) => {
      // Skip if student_details or user is undefined
      if (!due.student_details?.user) {
        console.warn("Skipping due with missing student details:", due);
        return acc;
      }

      const key = due.student_details.user.roll_number;
      if (!key) {
        console.warn("Skipping due with missing roll number:", due);
        return acc;
      }

      if (!acc[key]) {
        acc[key] = {
          roll_numbers: [due.student_details.user.roll_number],
          name: `${due.student_details.user.first_name || ""} ${
            due.student_details.user.last_name || ""
          }`.trim(),
          course: due.student_details.course || "N/A",
          caste: due.student_details.caste || "N/A",
          phone_number: due.student_details.phone_number || "N/A",
          dues: [],
          totalAmount: 0,
          unpaidAmount: 0,
          user: due.student_details.user,
        };
      }

      acc[key].dues.push(due);
      const amount = parseFloat(due.amount) || 0;
      acc[key].totalAmount += amount;
      if (!due.is_paid) {
        acc[key].unpaidAmount += amount;
      }

      return acc;
    }, {} as Record<string, StudentDetails>);

    return Object.values(grouped);
  };

  // Function to group academic dues by student
  const groupAcademicDuesByStudent = (dues: AcademicDue[]) => {
    if (!Array.isArray(dues)) {
      console.error("Invalid academic dues data:", dues);
      return [];
    }

    const grouped = dues.reduce((acc: Record<string, any>, due) => {
      // Skip if student is undefined
      if (!due.student) {
        console.warn("Skipping academic due with missing student:", due);
        return acc;
      }

      const key = due.student.roll_number;
      if (!key) {
        console.warn("Skipping academic due with missing roll number:", due);
        return acc;
      }

      if (!acc[key]) {
        acc[key] = {
          roll_numbers: [due.student.roll_number],
          name: due.student.full_name || "N/A",
          course: due.fee_structure?.course_name || "N/A",
          phone_number: due.student.phone_number || "N/A",
          caste: due.student.caste || "N/A",
          dues: [],
          totalAmount: 0,
          unpaidAmount: 0,
        };
      }

      acc[key].dues.push(due);
      return acc;
    }, {} as Record<string, any>);

    // For each group, sum only unique years for totalAmount and unpaidAmount
    Object.values(grouped).forEach((group: any) => {
      const seenYears = new Set<string>();
      group.totalAmount = 0;
      group.unpaidAmount = 0;
      group.dues.forEach((due: AcademicDue) => {
        if (!seenYears.has(due.academic_year_label)) {
          group.totalAmount += due.total_amount || 0;
          if (due.payment_status === "Unpaid") {
            group.unpaidAmount += due.unpaid_amount || 0;
          }
          seenYears.add(due.academic_year_label);
        }
      });
    });

    return Object.values(grouped);
  };

  // Unified filter for both department and academic dues
  const filterAndGroupDues = (): (
    | DepartmentStudentGroup
    | AcademicStudentGroup
  )[] => {
    let groups: any[] = [];
    if (showAcademicDues) {
      // Academic dues
      if (!Array.isArray(academicDues)) {
        console.error("Invalid academic dues data:", academicDues);
        return [];
      }
      let filtered = academicDues.filter((due) => {
        if (!due.student) return false;
        const search = searchTerm.trim().toLowerCase();
        const matchesSearch =
          !search ||
          (due.student.roll_number?.toLowerCase() || "").includes(search) ||
          (due.student.full_name?.toLowerCase() || "").includes(search) ||
          (due.fee_structure?.course_name?.toLowerCase() || "").includes(
            search
          );
        const matchesCourse =
          selectedCourse === "all" ||
          due.fee_structure?.course_name === selectedCourse;
        return matchesSearch && matchesCourse;
      });
      groups = groupAcademicDuesByStudent(filtered);
    } else {
      // Department dues
      if (!Array.isArray(departmentDues)) {
        console.error("Invalid department dues data:", departmentDues);
        return [];
      }
      let filtered = departmentDues.filter((due) => {
        if (!due.student_details?.user) return false;
        const search = searchTerm.trim().toLowerCase();
        const matchesSearch =
          !search ||
          (due.student_details.user.roll_number?.toLowerCase() || "").includes(
            search
          ) ||
          (
            (due.student_details.user.first_name || "") +
            " " +
            (due.student_details.user.last_name || "")
          )
            .toLowerCase()
            .includes(search) ||
          (due.student_details.course?.toLowerCase() || "").includes(search);
        const matchesPaidFilter =
          filterPaid === null || due.is_paid === filterPaid;
        const matchesCourse =
          selectedCourse === "all" ||
          due.student_details.course === selectedCourse;
        return matchesSearch && matchesPaidFilter && matchesCourse;
      });
      groups = groupDuesByStudent(filtered);
    }
    return groups;
  };

  const filteredGroups = filterAndGroupDues();

  useEffect(() => {
    console.log("StaffDashboard - Checking auth state:", {
      hasAccessToken: !!accessToken,
      urlDepartment,
      storedDepartment: localStorage.getItem("department"),
    });

    const storedDepartment = localStorage.getItem("department");
    if (!storedDepartment) {
      console.log("No department found in localStorage");
      navigate("/staff-login");
      return;
    }

    // If department is hostel or hostel_superintendent, redirect to hostel-dues page
    if (
      storedDepartment.toLowerCase() === "hostel" ||
      storedDepartment.toLowerCase() === "hostel_superintendent"
    ) {
      console.log(
        "Redirecting to hostel dues page for department:",
        storedDepartment
      );
      navigate("/hostel-dues", { replace: true });
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
    const department = localStorage.getItem("department");
    if (department && accessToken) {
      setLoading(true);
      if (department === "accounts") {
        getAcademicDues()
          .then((dues) => {
            setAcademicDues(dues);
            setShowAcademicDues(true);
          })
          .finally(() => setLoading(false));
      } else {
        getDepartmentDues(department)
          .then((dues) => {
            setDepartmentDues(dues);
            setShowAcademicDues(false);
          })
          .finally(() => setLoading(false));
      }
    }
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

  useEffect(() => {
    const fetchChallans = async () => {
      try {
        const data = await getChallans("staff");
        setChallans(data);
      } catch (error) {
        console.error("Error fetching challans:", error);
      }
    };
    fetchChallans();
  }, []);

  const getDepartmentIcon = () => {
    const department = localStorage.getItem("department")?.toLowerCase();
    switch (department) {
      case "library":
        return <BookOpen className="h-6 w-6 text-blue-600" />;
      case "hostel":
        return <Home className="h-6 w-6 text-green-600" />;
      case "accounts":
        return (
          <GraduationCap className="h-6 w-6 text-purple-600 bg-white rounded-full" />
        );
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

  // Function to handle student selection
  const handleStudentSelect = (student: StudentDetails) => {
    setSelectedStudent(student);
    setShowStudentDetails(true);
  };

  // Handle challan verification
  const handleVerify = async (
    id: number,
    status: "verified" | "rejected",
    remarks?: string
  ) => {
    try {
      const updatedChallan = await verifyChallan(id, status, remarks);
      setChallans(challans.map((c) => (c.id === id ? updatedChallan : c)));
      setIsVerifyModalOpen(false);
    } catch (error) {
      console.error("Error verifying challan:", error);
    }
  };

  // Handle challan view for verification
  const handleViewChallan = (challan: Challan) => {
    setSelectedChallan(challan);
    setIsVerifyModalOpen(true);
  };

  const handleViewChallans = (student: StudentProfile) => {
    const studentChallans = challans.filter(
      (c) =>
        c.student &&
        c.student.roll_number ===
          (student.roll_numbers?.[0] || student.roll_number)
    );
    setSelectedStudentChallans(studentChallans);
    setSelectedStudentForChallans({
      id: student.id,
      full_name: student.name || student.full_name,
      roll_number: student.roll_numbers?.[0] || student.roll_number,
      caste: student.caste,
      phone_number: student.phone_number,
    });
    setShowChallanModal(true);
  };

  const handleChallanStatusUpdate = async (
    challanId: number,
    status: "verified" | "rejected",
    remarks: string
  ) => {
    try {
      setIsUpdatingChallan((prev) => ({ ...prev, [challanId]: true }));
      const updatedChallan = await verifyChallan(challanId, status, remarks);

      // Update the challan in the local state
      setSelectedStudentChallans((prev) =>
        prev.map((c) =>
          c.id === challanId
            ? {
                ...c,
                status: updatedChallan.status,
                remarks: updatedChallan.remarks,
              }
            : c
        )
      );

      // Update the main challans list
      setChallans((prev) =>
        prev.map((c) =>
          c.id === challanId
            ? {
                ...c,
                status: updatedChallan.status,
                remarks: updatedChallan.remarks,
              }
            : c
        )
      );

      // Clear remarks for this challan
      setChallanRemarks((prev) => {
        const newRemarks = { ...prev };
        delete newRemarks[challanId];
        return newRemarks;
      });

      // Show success message
      alert(`Challan ${status} successfully!`);
    } catch (error) {
      console.error("Error updating challan:", error);
      alert("Failed to update challan status");
    } finally {
      setIsUpdatingChallan((prev) => ({ ...prev, [challanId]: false }));
    }
  };

  if (!accessToken) {
    // --- DEVELOPMENT ONLY: Commented out auth check for easier testing ---
    // return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-4">
            <div className="bg-gradient-to-br from-blue-600  to-purple-600 p-3 rounded-xl shadow-md">
              {getDepartmentIcon()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-bold text-gray-900">
                  {showAcademicDues ? "Academic Dues" : getDepartmentTitle()}
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
              variant="outline"
              onClick={logout}
              className="hover:bg-red-50 hover:text-red-600 hover:border-red-200"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
            <Button
              variant="outline"
              className="bg-green-600 text-white hover:bg-green-700 ml-2"
              onClick={() =>
                window.open(
                  "https://www.onlinesbi.sbi/sbicollect/payment/listinstitution.htm",
                  "_blank"
                )
              }
            >
              Pay Now
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
                <div className="flex items-center gap-4">
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
                  {/* New Paid/Unpaid Filter */}
                  <div className="flex items-center space-x-2">
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
            </div>

            {/* Dues Table */}
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-gray-600" />
              </div>
            ) : (
              <div className="overflow-x-auto w-full">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-blue-50">
                      <TableHead className="w-8"></TableHead>
                      <TableHead>Student Details</TableHead>
                      <TableHead>Course Info</TableHead>
                      <TableHead>Dues Summary</TableHead>
                      <TableHead>Challans</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredGroups.map((group) => (
                      <React.Fragment key={group.roll_numbers[0]}>
                        <TableRow className="hover:bg-gray-50">
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
                                onClick={() =>
                                  handleStudentSelect(group as StudentDetails)
                                }
                                className="font-medium text-gray-900 hover:text-gray-700 p-0 h-auto"
                              >
                                {group.name}
                              </Button>
                              {/* Show verify button for pending academic challan */}
                              {"user" in group &&
                                group.user &&
                                challans
                                  .filter(
                                    (c) =>
                                      c.department === "academic" &&
                                      c.status === "pending" &&
                                      c.student &&
                                      c.student.roll_number ===
                                        group.roll_numbers[0]
                                  )
                                  .map((challan) => (
                                    <span
                                      key={challan.id}
                                      style={{
                                        display: "inline-flex",
                                        alignItems: "center",
                                        marginLeft: 8,
                                      }}
                                    >
                                      <img
                                        src={challan.image}
                                        alt="Challan"
                                        style={{
                                          width: 40,
                                          height: 40,
                                          objectFit: "cover",
                                          borderRadius: 4,
                                          border: "1px solid #ddd",
                                          marginRight: 8,
                                        }}
                                      />
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="ml-2"
                                        onClick={() =>
                                          handleViewChallan(challan)
                                        }
                                      >
                                        Verify
                                      </Button>
                                    </span>
                                  ))}
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
                                Total Amount: ₹{group.totalAmount.toFixed(2)}
                              </div>
                              <div className="flex items-center gap-2 text-red-600 mt-1">
                                <AlertCircle className="h-4 w-4" />
                                Total Due: ₹{group.unpaidAmount.toFixed(2)}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {challans.some(
                              (c) =>
                                c.student &&
                                c.student.roll_number ===
                                  group.roll_numbers[0] &&
                                c.status === "pending"
                            ) ? (
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex items-center gap-2 text-blue-600 border-blue-200 hover:bg-blue-50"
                                onClick={() =>
                                  handleViewChallans(
                                    group as unknown as StudentProfile
                                  )
                                }
                              >
                                <Receipt className="h-4 w-4" />
                                View Challans
                              </Button>
                            ) : challans.some(
                                (c) =>
                                  c.student &&
                                  c.student.roll_number ===
                                    group.roll_numbers[0]
                              ) ? (
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex items-center gap-2 text-gray-600 border-gray-200 hover:bg-gray-50"
                                onClick={() =>
                                  handleViewChallans(
                                    group as unknown as StudentProfile
                                  )
                                }
                              >
                                <Receipt className="h-4 w-4" />
                                View History
                              </Button>
                            ) : (
                              <span className="text-gray-400 text-sm">
                                No challans
                              </span>
                            )}
                          </TableCell>
                        </TableRow>
                        {expandedRows.has(group.roll_numbers[0]) && (
                          <TableRow>
                            <TableCell colSpan={4} className="p-0">
                              <div className="bg-gray-50 p-4 overflow-x-auto w-full">
                                <Table>
                                  <TableHeader>
                                    <TableRow className="bg-gray-100">
                                      {showAcademicDues ? (
                                        <>
                                          <TableHead>Year</TableHead>
                                          <TableHead>Tuition Fee</TableHead>
                                          <TableHead>Special Fee</TableHead>
                                          <TableHead>Exam Fee</TableHead>
                                          <TableHead>Paid by Govt</TableHead>
                                          <TableHead>Paid by Student</TableHead>
                                          <TableHead>Due Amount</TableHead>
                                          <TableHead>Total Amount</TableHead>
                                          <TableHead>Unpaid Amount</TableHead>
                                          <TableHead>Actions</TableHead>
                                        </>
                                      ) : (
                                        <>
                                          <TableHead>Due Date</TableHead>
                                          <TableHead>Description</TableHead>
                                          <TableHead>Amount</TableHead>
                                          <TableHead>Actions</TableHead>
                                        </>
                                      )}
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {showAcademicDues
                                      ? (() => {
                                          // Get only the first due for each unique year
                                          const seenYears = new Set<string>();
                                          const uniqueDues = (
                                            group as AcademicStudentGroup
                                          ).dues.filter((due) => {
                                            if (
                                              seenYears.has(
                                                due.academic_year_label
                                              )
                                            )
                                              return false;
                                            seenYears.add(
                                              due.academic_year_label
                                            );
                                            return true;
                                          });
                                          return uniqueDues.map((acadDue) => (
                                            <TableRow
                                              key={acadDue.academic_year_label}
                                              className="hover:bg-gray-50"
                                            >
                                              <TableCell>
                                                {acadDue.academic_year_label}
                                              </TableCell>
                                              <TableCell>
                                                ₹
                                                {
                                                  acadDue.fee_structure
                                                    .tuition_fee
                                                }
                                              </TableCell>
                                              <TableCell>
                                                ₹
                                                {
                                                  acadDue.fee_structure
                                                    .special_fee
                                                }
                                              </TableCell>
                                              <TableCell>
                                                ₹
                                                {acadDue.fee_structure.exam_fee}
                                              </TableCell>
                                              <TableCell>
                                                ₹{acadDue.paid_by_govt}
                                              </TableCell>
                                              <TableCell>
                                                ₹{acadDue.paid_by_student}
                                              </TableCell>
                                              <TableCell>
                                                ₹{acadDue.due_amount}
                                              </TableCell>
                                              <TableCell>
                                                ₹{acadDue.total_amount}
                                              </TableCell>
                                              <TableCell>
                                                ₹{acadDue.unpaid_amount}
                                              </TableCell>
                                              <TableCell>
                                                <Button
                                                  variant="outline"
                                                  size="sm"
                                                  className="text-blue-600 border-blue-200 hover:bg-blue-50"
                                                  onClick={() => {
                                                    setDueToUpdate(acadDue);
                                                    setShowUpdateDueModal(true);
                                                  }}
                                                >
                                                  Update
                                                </Button>
                                              </TableCell>
                                            </TableRow>
                                          ));
                                        })()
                                      : (
                                          group as DepartmentStudentGroup
                                        ).dues.map((deptDue) => (
                                          <TableRow
                                            key={deptDue.id}
                                            className="hover:bg-gray-50"
                                          >
                                            <TableCell>
                                              <div className="flex items-center gap-2">
                                                <Calendar className="h-4 w-4 text-gray-600" />
                                                {format(
                                                  new Date(deptDue.due_date),
                                                  "dd MMM yyyy"
                                                )}
                                              </div>
                                            </TableCell>
                                            <TableCell>
                                              {deptDue.description}
                                            </TableCell>
                                            <TableCell>
                                              <div className="flex items-center gap-2">
                                                <IndianRupee className="h-4 w-4 text-gray-600" />
                                                {deptDue.amount}
                                              </div>
                                            </TableCell>
                                            <TableCell>null</TableCell>
                                          </TableRow>
                                        ))}
                                  </TableBody>
                                </Table>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </React.Fragment>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Student Details Modal */}
        <Dialog open={showStudentDetails} onOpenChange={setShowStudentDetails}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Student Details</DialogTitle>
              <DialogDescription>
                View detailed information about the selected student.
              </DialogDescription>
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
                    <p className="text-sm text-gray-500">Caste</p>
                    <p className="font-medium">
                      {showAcademicDues
                        ? selectedStudent.dues &&
                          selectedStudent.dues.length > 0 &&
                          typeof selectedStudent.dues[0] === "object" &&
                          "student" in selectedStudent.dues[0] &&
                          typeof (selectedStudent.dues[0] as any).student ===
                            "object" &&
                          (selectedStudent.dues[0] as any).student.caste
                          ? (selectedStudent.dues[0] as any).student.caste
                          : "N/A"
                        : selectedStudent.caste || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Phone Number</p>
                    <p className="font-medium">
                      {selectedStudent.phone_number}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Update Academic Due Modal */}
        <Dialog open={showUpdateDueModal} onOpenChange={setShowUpdateDueModal}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Update Academic Due</DialogTitle>
              <DialogDescription>
                Update the Paid by Govt and Paid by Student fields for this due.
              </DialogDescription>
            </DialogHeader>
            {dueToUpdate && (
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Year</p>
                  <p className="font-medium">
                    {dueToUpdate.academic_year_label}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Paid by Govt
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                      <IndianRupee className="h-4 w-4" />
                    </span>
                    <Input
                      type="number"
                      min={0}
                      placeholder="Enter amount"
                      className="pl-8"
                      value={
                        dueToUpdate.paid_by_govt === 0
                          ? ""
                          : dueToUpdate.paid_by_govt
                      }
                      onChange={(e) => {
                        const val =
                          e.target.value === "" ? 0 : Number(e.target.value);
                        setDueToUpdate({ ...dueToUpdate, paid_by_govt: val });
                      }}
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    Enter the amount paid by government (leave blank for 0).
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Paid by Student
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                      <IndianRupee className="h-4 w-4" />
                    </span>
                    <Input
                      type="number"
                      min={0}
                      placeholder="Enter amount"
                      className="pl-8"
                      value={
                        dueToUpdate.paid_by_student === 0
                          ? ""
                          : dueToUpdate.paid_by_student
                      }
                      onChange={(e) => {
                        const val =
                          e.target.value === "" ? 0 : Number(e.target.value);
                        setDueToUpdate({
                          ...dueToUpdate,
                          paid_by_student: val,
                        });
                      }}
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    Enter the amount paid by student (leave blank for 0).
                  </p>
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <Button
                    variant="outline"
                    onClick={() => setShowUpdateDueModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={async () => {
                      if (!dueToUpdate) return;
                      setIsUpdatingDue(true);
                      try {
                        await updateAcademicDue(dueToUpdate.id, {
                          paid_by_govt: dueToUpdate.paid_by_govt || 0,
                          paid_by_student: dueToUpdate.paid_by_student || 0,
                        });
                        // Refresh academic dues
                        const dues = await getAcademicDues();
                        setAcademicDues(dues);
                        setShowUpdateDueModal(false);
                      } catch (err) {
                        alert("Failed to update due.");
                      } finally {
                        setIsUpdatingDue(false);
                      }
                    }}
                    disabled={isUpdatingDue}
                    className={
                      isUpdatingDue
                        ? "bg-blue-400 text-white cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-700 text-white"
                    }
                  >
                    Save
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Verify Challan Modal */}
        <Dialog open={isVerifyModalOpen} onOpenChange={setIsVerifyModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Verify Challan</DialogTitle>
            </DialogHeader>
            {selectedChallan && (
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  const status = formData.get("status") as
                    | "verified"
                    | "rejected";
                  const remarks = formData.get("remarks") as string;
                  try {
                    await verifyChallan(selectedChallan.id, status, remarks);
                    alert(`Challan updated! Challan marked as ${status}.`);
                    setIsVerifyModalOpen(false);
                    // Refresh challans
                    const data = await getChallans();
                    setChallans(data);
                  } catch (error) {
                    alert("Failed to update challan.");
                  }
                }}
              >
                <p>
                  <b>Amount:</b> ₹{selectedChallan.amount}
                </p>
                <img
                  src={selectedChallan.image}
                  alt="Challan"
                  className="max-w-full max-h-64 rounded border"
                />
                <p>
                  <b>Remarks:</b> {selectedChallan.remarks || "-"}
                </p>
                <select
                  name="status"
                  required
                  defaultValue={selectedChallan.status}
                  className="mt-2 mb-2"
                >
                  <option value="verified">Verify</option>
                  <option value="rejected">Reject</option>
                </select>
                <Input
                  type="text"
                  name="remarks"
                  placeholder="Remarks"
                  className="mb-2"
                />
                <div className="flex gap-2 mt-2">
                  <Button type="submit">Submit</Button>
                  <Button
                    type="button"
                    onClick={() => setIsVerifyModalOpen(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            )}
          </DialogContent>
        </Dialog>

        {/* Student Challans Modal */}
        <Dialog open={showChallanModal} onOpenChange={setShowChallanModal}>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>Student Challans</DialogTitle>
              <DialogDescription>
                View all challans for {selectedStudentForChallans?.full_name} (
                {selectedStudentForChallans?.roll_number})
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {selectedStudentChallans.length === 0 ? (
                <div className="text-center py-4 text-gray-500">
                  No challans found for this student.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedStudentChallans.map((challan) => (
                    <Card key={challan.id} className="overflow-hidden">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Receipt className="h-5 w-5 text-blue-600" />
                            <span className="font-medium">
                              ₹{challan.amount}
                            </span>
                          </div>
                          <div
                            className={`px-2 py-1 rounded text-xs ${
                              challan.status === "verified"
                                ? "bg-green-100 text-green-700"
                                : challan.status === "rejected"
                                ? "bg-red-100 text-red-700"
                                : "bg-yellow-100 text-yellow-700"
                            }`}
                          >
                            {challan.status.charAt(0).toUpperCase() +
                              challan.status.slice(1)}
                          </div>
                        </div>
                        <img
                          src={challan.image}
                          alt="Challan"
                          className="w-full h-48 object-cover rounded-md mb-2"
                        />
                        <div className="text-sm text-gray-600 mb-3">
                          <p>
                            <span className="font-medium">Department:</span>{" "}
                            {challan.department}
                          </p>
                          <p>
                            <span className="font-medium">Remarks:</span>{" "}
                            {challan.remarks || "-"}
                          </p>
                          <p>
                            <span className="font-medium">Uploaded:</span>{" "}
                            {new Date(challan.uploaded_at).toLocaleDateString()}
                          </p>
                        </div>

                        {challan.status === "pending" && (
                          <div className="space-y-3">
                            <div className="flex items-center gap-2">
                              <MessageSquare className="h-4 w-4 text-gray-500" />
                              <Input
                                placeholder="Add remarks..."
                                value={challanRemarks[challan.id] || ""}
                                onChange={(e) =>
                                  setChallanRemarks((prev) => ({
                                    ...prev,
                                    [challan.id]: e.target.value,
                                  }))
                                }
                                className="flex-1"
                              />
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex-1 bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                                onClick={() =>
                                  handleChallanStatusUpdate(
                                    challan.id,
                                    "verified",
                                    challanRemarks[challan.id] || ""
                                  )
                                }
                                disabled={isUpdatingChallan[challan.id]}
                              >
                                {isUpdatingChallan[challan.id] ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <>
                                    <CheckCircle2 className="h-4 w-4 mr-1" />
                                    Verify
                                  </>
                                )}
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex-1 bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
                                onClick={() =>
                                  handleChallanStatusUpdate(
                                    challan.id,
                                    "rejected",
                                    challanRemarks[challan.id] || ""
                                  )
                                }
                                disabled={isUpdatingChallan[challan.id]}
                              >
                                {isUpdatingChallan[challan.id] ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <>
                                    <XCircle className="h-4 w-4 mr-1" />
                                    Reject
                                  </>
                                )}
                              </Button>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
