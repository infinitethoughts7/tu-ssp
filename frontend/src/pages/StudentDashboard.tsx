import React, { useEffect, useState } from "react";
import { getAcademicDues, getHostelDues } from "../services/departmentService";
import api from "../services/api";
import { useAuth } from "../context/useAuth";
import {
  School,
  Home,
  IndianRupee,
  AlertCircle,
  LogOut,
  User,
  ChevronDown,
  ChevronRight,
  CreditCard,
  Building2,
  BookOpen,
  Beaker,
  Trophy,
} from "lucide-react";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "../components/ui/popover";
import axios from "axios";
import { Avatar, AvatarFallback } from "../components/ui/avatar";

interface UserProfile {
  user: {
    first_name: string;
    last_name: string;
  };
  roll_number: string;
  course: string;
}

const StudentDashboard: React.FC = () => {
  const { logout, accessToken, user } = useAuth();
  const userProfile = user as unknown as UserProfile;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [academicDues, setAcademicDues] = useState<any[]>([]);
  const [hostelDues, setHostelDues] = useState<any[]>([]);
  const [otherDues, setOtherDues] = useState<any[]>([]);
  const [showAcademic, setShowAcademic] = useState(false);
  const [showHostel, setShowHostel] = useState(false);
  const [showLibrary, setShowLibrary] = useState(false);
  const [showLab, setShowLab] = useState(false);
  const [showSports, setShowSports] = useState(false);
  const [totalDues, setTotalDues] = useState({
    academic_total: 0,
    hostel_total: 0,
    library_total: 0,
    lab_total: 0,
    sports_total: 0,
    grand_total: 0,
  });

  // Add logging for user profile
  useEffect(() => {
    console.log("Current user:", user);
    console.log("Access token:", accessToken);
  }, [user, accessToken]);

  // Filter academic dues to only show one entry per year (remove duplicates)
  const uniqueAcademicDues = React.useMemo(() => {
    const seenYears = new Set();
    return academicDues.filter((due: any) => {
      if (seenYears.has(due.academic_year_label)) return false;
      seenYears.add(due.academic_year_label);
      return true;
    });
  }, [academicDues]);

  const fetchOtherDues = async () => {
    try {
      console.log("Fetching other dues...");
      console.log("Current user profile:", user);
      console.log("Making API call to /dues/other-dues/");

      const response = await api.get("/dues/other-dues/");
      console.log("Other dues response:", response.data);

      if (
        response.data &&
        response.data.dues &&
        Array.isArray(response.data.dues)
      ) {
        setOtherDues(response.data.dues);
        setTotalDues(response.data.total_dues);
      }
    } catch (error) {
      console.error("Error fetching other dues:", error);
      if (axios.isAxiosError(error)) {
        console.error("Error details:", {
          status: error.response?.status,
          data: error.response?.data,
          headers: error.response?.headers,
          message: error.message,
          config: {
            url: error.config?.url,
            method: error.config?.method,
            headers: error.config?.headers,
          },
        });
      }
    }
  };

  useEffect(() => {
    const getDues = async () => {
      if (!accessToken) {
        setError("No authentication token found. Please login again.");
        setLoading(false);
        return;
      }
      try {
        console.log("Starting to fetch all dues...");
        const academicData = await getAcademicDues();
        setAcademicDues(academicData);
        const hostelData = await getHostelDues();
        setHostelDues(hostelData);
        await fetchOtherDues();
        setError(null);
      } catch (error) {
        console.error("Error in getDues:", error);
        setError("Failed to fetch dues. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    getDues();
  }, [accessToken]);

  // Add console log to check otherDues state
  useEffect(() => {
    console.log("Current otherDues state:", otherDues);
  }, [otherDues]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center p-8 bg-white rounded-lg shadow">
          <div className="w-16 h-16 border-4 border-t-gray-800 border-b-gray-300 border-l-gray-300 border-r-gray-300 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-800 text-xl font-medium">
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center p-8 bg-white rounded-lg shadow max-w-md w-full">
          <div className="text-red-600 text-xl mb-4 font-medium">{error}</div>
          <button
            onClick={logout}
            className="bg-gray-800 text-white px-6 py-2 rounded-md hover:bg-gray-700 transition shadow w-full"
          >
            Logout
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="bg-white p-2 rounded-lg shadow-md">
              <img
                src="/src/components/ui/assets/Telangana_University_logo.png"
                alt="Telangana University Logo"
                className="h-16 w-auto object-contain"
              />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-blue-600">
                Telangana University
              </h1>
              <p className="text-sm text-gray-900 font-medium mt-1">
                Student Service Portal
              </p>
            </div>
          </div>
          {/* Profile Popover and Logout */}
          <div className="flex items-center gap-3">
            <Popover>
              <PopoverTrigger asChild>
                <button className="flex items-center gap-2 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full p-2 px-5 focus:outline-none focus:ring-2 focus:ring-blue-400">
                  <User className="h-7 w-7 text-white" />
                  <span className="text-base font-semibold text-white hidden sm:block">
                    {userProfile?.user?.first_name}{" "}
                    {userProfile?.user?.last_name}
                  </span>
                </button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-auto p-6">
                <div className="flex flex-col gap-4 min-w-[220px]">
                  {/* Name */}
                  <div className="flex items-center gap-3">
                    <div className="bg-gradient-to-br from-blue-500 to-purple-500 rounded-full p-2 flex items-center justify-center">
                      <User className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <div className="text-gray-500 text-xs font-medium">
                        Name
                      </div>
                      <div className="text-base font-semibold text-gray-900">
                        {userProfile?.user?.first_name}{" "}
                        {userProfile?.user?.last_name}
                      </div>
                    </div>
                  </div>
                  {/* Roll Number */}
                  <div className="flex items-center gap-3">
                    <div className="bg-green-500 rounded-full p-2 flex items-center justify-center">
                      <span className="text-white font-bold text-base">#</span>
                    </div>
                    <div>
                      <div className="text-gray-500 text-xs font-medium">
                        Roll Number
                      </div>
                      <div className="text-base font-semibold text-gray-900">
                        {userProfile?.roll_number}
                      </div>
                    </div>
                  </div>
                  {/* Department */}
                  <div className="flex items-center gap-3">
                    <div className="bg-orange-400 rounded-full p-2 flex items-center justify-center">
                      <Building2 className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <div className="text-gray-500 text-xs font-medium">
                        Department
                      </div>
                      <div className="text-base font-semibold text-gray-900">
                        {userProfile?.course}
                      </div>
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
            <button
              onClick={logout}
              className="flex items-center gap-1 bg-red-100 hover:bg-red-200 text-red-700 font-semibold px-4 py-2 rounded-full transition shadow-sm border border-red-200 focus:outline-none focus:ring-2 focus:ring-red-400"
              title="Logout"
            >
              <LogOut className="h-5 w-5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>
      <main className="container mx-auto px-6 py-8">
        {/* Profile Card */}
        <Card className="border-none shadow-lg bg-white mb-8">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white text-xl">
                    {userProfile?.user?.first_name?.[0]}
                    {userProfile?.user?.last_name?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {userProfile?.user?.first_name}{" "}
                    {userProfile?.user?.last_name}
                  </h2>
                  <p className="text-gray-600">
                    Roll No: {userProfile?.roll_number}
                  </p>
                  <p className="text-gray-600">{userProfile?.course}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Total Outstanding</p>
                <p className="text-3xl font-bold text-red-600">
                  ₹{totalDues.grand_total}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Academic Dues Section */}
        <Card className="border-none shadow-lg bg-white mb-8">
          <CardHeader
            onClick={() => setShowAcademic((prev) => !prev)}
            className="cursor-pointer select-none"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-blue-700 p-2 rounded-lg shadow-md">
                  <School className="h-5 w-5 text-white" />
                </div>
                <CardTitle className="text-gray-800 flex items-center gap-2">
                  Academic Dues
                  {showAcademic ? (
                    <ChevronDown className="h-5 w-5 text-gray-500 transition-transform duration-200" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-gray-500 transition-transform duration-200" />
                  )}
                </CardTitle>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Total Due</p>
                <p className="text-xl font-bold text-red-600">
                  ₹{totalDues.academic_total}
                </p>
              </div>
            </div>
          </CardHeader>
          {showAcademic && (
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50/50">
                    <TableHead>Year</TableHead>
                    <TableHead>Tuition Fee</TableHead>
                    <TableHead>Special Fee</TableHead>
                    <TableHead>Exam Fee</TableHead>
                    <TableHead>Paid by Govt</TableHead>
                    <TableHead>Paid by Student</TableHead>
                    <TableHead>Due Amount</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {uniqueAcademicDues.map((due: any) => (
                    <TableRow key={due.id}>
                      <TableCell>{due.academic_year_label}</TableCell>
                      <TableCell>
                        ₹
                        {due.fee_structure?.tuition_fee?.toLocaleString() ||
                          "0"}
                      </TableCell>
                      <TableCell>
                        ₹
                        {due.fee_structure?.special_fee?.toLocaleString() ||
                          "0"}
                      </TableCell>
                      <TableCell>
                        ₹{due.fee_structure?.exam_fee?.toLocaleString() || "0"}
                      </TableCell>
                      <TableCell>
                        ₹{due.paid_by_govt?.toLocaleString() || "0"}
                      </TableCell>
                      <TableCell>
                        ₹{due.paid_by_student?.toLocaleString() || "0"}
                      </TableCell>
                      <TableCell>
                        ₹{due.due_amount?.toLocaleString() || "0"}
                      </TableCell>
                      <TableCell>
                        {due.payment_status === "Unpaid" ? (
                          <span className="text-red-600 font-semibold">
                            Unpaid
                          </span>
                        ) : (
                          <span className="text-green-600 font-semibold">
                            Paid
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-4 mt-4 w-full">
                <Button className="bg-blue-600 text-white flex items-center gap-2 w-full sm:w-auto px-4 py-2 sm:px-6 sm:py-2 text-base sm:text-sm">
                  <CreditCard className="h-4 w-4" />
                  Pay Now
                </Button>
              </div>
            </CardContent>
          )}
        </Card>
        {/* Hostel Dues Section */}
        <Card className="border-none shadow-lg bg-white mb-8">
          <CardHeader
            onClick={() => setShowHostel((prev) => !prev)}
            className="cursor-pointer select-none"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-purple-700 p-2 rounded-lg shadow-md">
                  <Home className="h-5 w-5 text-white" />
                </div>
                <CardTitle className="text-gray-800 flex items-center gap-2">
                  Hostel Dues
                  {showHostel ? (
                    <ChevronDown className="h-5 w-5 text-gray-500 transition-transform duration-200" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-gray-500 transition-transform duration-200" />
                  )}
                </CardTitle>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Total Due</p>
                <p className="text-xl font-bold text-red-600">
                  ₹{totalDues.hostel_total}
                </p>
              </div>
            </div>
          </CardHeader>
          {showHostel && (
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50/50">
                    <TableHead>Year</TableHead>
                    <TableHead>Mess Bill</TableHead>
                    <TableHead>Scholarship</TableHead>
                    <TableHead>Deposit</TableHead>
                    <TableHead>Remarks</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {hostelDues.map((due: any) => (
                    <TableRow key={due.id}>
                      <TableCell>{due.year_of_study}</TableCell>
                      <TableCell>
                        ₹{due.mess_bill?.toLocaleString() || "0"}
                      </TableCell>
                      <TableCell>
                        ₹{due.scholarship?.toLocaleString() || "0"}
                      </TableCell>
                      <TableCell>
                        ₹{due.deposit?.toLocaleString() || "0"}
                      </TableCell>
                      <TableCell>{due.remarks || "No remarks"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-4 mt-4 w-full">
                <Button className="bg-blue-600 text-white flex items-center gap-2 w-full sm:w-auto px-4 py-2 sm:px-6 sm:py-2 text-base sm:text-sm">
                  <CreditCard className="h-4 w-4" />
                  Pay Now
                </Button>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Library Dues Section */}
        <Card className="border-none shadow-lg bg-white mb-8">
          <CardHeader
            onClick={() => setShowLibrary((prev) => !prev)}
            className="cursor-pointer select-none"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-blue-600 p-2 rounded-lg shadow-md">
                  <BookOpen className="h-5 w-5 text-white" />
                </div>
                <CardTitle className="text-gray-800 flex items-center gap-2">
                  Library Dues
                  {showLibrary ? (
                    <ChevronDown className="h-5 w-5 text-gray-500 transition-transform duration-200" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-gray-500 transition-transform duration-200" />
                  )}
                </CardTitle>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Total Due</p>
                <p className="text-xl font-bold text-red-600">
                  ₹{totalDues.library_total}
                </p>
              </div>
            </div>
          </CardHeader>
          {showLibrary && (
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50/50">
                    <TableHead>Amount</TableHead>
                    <TableHead>Remark</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {otherDues
                    .filter((due) => due.category === "librarian")
                    .map((due, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          ₹{due.amount?.toLocaleString() || "0"}
                        </TableCell>
                        <TableCell>{due.remark || "No library dues"}</TableCell>
                        <TableCell>
                          {due.created_at
                            ? new Date(due.created_at).toLocaleDateString()
                            : "-"}
                        </TableCell>
                        <TableCell>
                          {due.amount && due.amount > 0 ? (
                            <span className="text-red-600 font-semibold">
                              Unpaid
                            </span>
                          ) : (
                            <span className="text-green-600 font-semibold">
                              No Dues
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  {otherDues.filter((due) => due.category === "librarian")
                    .length === 0 && (
                    <TableRow>
                      <TableCell>₹0</TableCell>
                      <TableCell>No library dues</TableCell>
                      <TableCell>-</TableCell>
                      <TableCell>
                        <span className="text-green-600 font-semibold">
                          No Dues
                        </span>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
              <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-4 mt-4 w-full">
                <Button className="bg-blue-600 text-white flex items-center gap-2 w-full sm:w-auto px-4 py-2 sm:px-6 sm:py-2 text-base sm:text-sm">
                  <CreditCard className="h-4 w-4" />
                  Pay Now
                </Button>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Lab Dues Section */}
        <Card className="border-none shadow-lg bg-white mb-8">
          <CardHeader
            onClick={() => setShowLab((prev) => !prev)}
            className="cursor-pointer select-none"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-purple-600 p-2 rounded-lg shadow-md">
                  <Beaker className="h-5 w-5 text-white" />
                </div>
                <CardTitle className="text-gray-800 flex items-center gap-2">
                  Lab Dues
                  {showLab ? (
                    <ChevronDown className="h-5 w-5 text-gray-500 transition-transform duration-200" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-gray-500 transition-transform duration-200" />
                  )}
                </CardTitle>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Total Due</p>
                <p className="text-xl font-bold text-red-600">
                  ₹{totalDues.lab_total}
                </p>
              </div>
            </div>
          </CardHeader>
          {showLab && (
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50/50">
                    <TableHead>Amount</TableHead>
                    <TableHead>Remark</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {otherDues
                    .filter((due) => due.category === "lab_incharge")
                    .map((due, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          ₹{due.amount?.toLocaleString() || "0"}
                        </TableCell>
                        <TableCell>{due.remark || "No lab dues"}</TableCell>
                        <TableCell>
                          {due.created_at
                            ? new Date(due.created_at).toLocaleDateString()
                            : "-"}
                        </TableCell>
                        <TableCell>
                          {due.amount && due.amount > 0 ? (
                            <span className="text-red-600 font-semibold">
                              Unpaid
                            </span>
                          ) : (
                            <span className="text-green-600 font-semibold">
                              No Dues
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  {otherDues.filter((due) => due.category === "lab_incharge")
                    .length === 0 && (
                    <TableRow>
                      <TableCell>₹0</TableCell>
                      <TableCell>No lab dues</TableCell>
                      <TableCell>-</TableCell>
                      <TableCell>
                        <span className="text-green-600 font-semibold">
                          No Dues
                        </span>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
              <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-4 mt-4 w-full">
                <Button className="bg-blue-600 text-white flex items-center gap-2 w-full sm:w-auto px-4 py-2 sm:px-6 sm:py-2 text-base sm:text-sm">
                  <CreditCard className="h-4 w-4" />
                  Pay Now
                </Button>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Sports Dues Section */}
        <Card className="border-none shadow-lg bg-white mb-8">
          <CardHeader
            onClick={() => setShowSports((prev) => !prev)}
            className="cursor-pointer select-none"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-yellow-600 p-2 rounded-lg shadow-md">
                  <Trophy className="h-5 w-5 text-white" />
                </div>
                <CardTitle className="text-gray-800 flex items-center gap-2">
                  Sports Dues
                  {showSports ? (
                    <ChevronDown className="h-5 w-5 text-gray-500 transition-transform duration-200" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-gray-500 transition-transform duration-200" />
                  )}
                </CardTitle>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Total Due</p>
                <p className="text-xl font-bold text-red-600">
                  ₹{totalDues.sports_total}
                </p>
              </div>
            </div>
          </CardHeader>
          {showSports && (
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50/50">
                    <TableHead>Amount</TableHead>
                    <TableHead>Remark</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {otherDues
                    .filter((due) => due.category === "sports_incharge")
                    .map((due, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          ₹{due.amount?.toLocaleString() || "0"}
                        </TableCell>
                        <TableCell>{due.remark || "No sports dues"}</TableCell>
                        <TableCell>
                          {due.created_at
                            ? new Date(due.created_at).toLocaleDateString()
                            : "-"}
                        </TableCell>
                        <TableCell>
                          {due.amount && due.amount > 0 ? (
                            <span className="text-red-600 font-semibold">
                              Unpaid
                            </span>
                          ) : (
                            <span className="text-green-600 font-semibold">
                              No Dues
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  {otherDues.filter((due) => due.category === "sports_incharge")
                    .length === 0 && (
                    <TableRow>
                      <TableCell>₹0</TableCell>
                      <TableCell>No sports dues</TableCell>
                      <TableCell>-</TableCell>
                      <TableCell>
                        <span className="text-green-600 font-semibold">
                          No Dues
                        </span>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
              <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-4 mt-4 w-full">
                <Button className="bg-blue-600 text-white flex items-center gap-2 w-full sm:w-auto px-4 py-2 sm:px-6 sm:py-2 text-base sm:text-sm">
                  <CreditCard className="h-4 w-4" />
                  Pay Now
                </Button>
              </div>
            </CardContent>
          )}
        </Card>
      </main>
    </div>
  );
};

export default StudentDashboard;
