import React, { useEffect, useState } from "react";
import { useAuth } from "../context/useAuth";
import {
  getHostelDues,
  getStaffProfile,
  StaffProfile,
  updateHostelDue,
} from "../services/departmentService";
import {
  Loader2,
  AlertCircle,
  Search,
  User,
  Phone,
  Mail,
  Briefcase,
  ChevronDown,
  ChevronRight,
  LogOut,
  IndianRupee,
  Calendar,
  Filter,
  BarChart3,
  Settings,
  MoreHorizontal,
  X,
} from "lucide-react";
import { format } from "date-fns";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../components/ui/dialog";
import { COURSE_OPTIONS } from "../types/constants";

interface HostelDue {
  id: string;
  year_of_study: string;
  mess_bill: number;
  scholarship: number;
  deposit: number;
  remarks: string;
  total_amount: number;
  due_amount: number;
  student: {
    roll_number: string;
    full_name: string;
    phone_number: string;
    caste: string;
    course: string;
  };
}

interface HostelStudentGroup {
  roll_numbers: string[];
  name: string;
  course: string;
  caste: string;
  phone_number: string;
  dues: HostelDue[];
  total_amount: number;
  due_amount: number;
}

interface HostelStatistics {
  total_records: number;
  records_with_dues: number;
  records_without_dues: number;
  total_due_amount: number;
  available_years: number[];
}

// Memoized table row component for better performance
const HostelRecordRow = React.memo(
  ({
    group,
    handleStudentSelect,
  }: {
    group: HostelStudentGroup;
    handleStudentSelect: (student: any) => void;
  }) => {
    const totalDue = group.due_amount;
    const isDue = totalDue > 0;

    return (
      <TableRow className="hover:bg-blue-50/50 transition-colors">
        <TableCell className="w-12"></TableCell>
        <TableCell className="align-middle text-left">
          <div className="space-y-1">
            <button
              className="font-semibold text-blue-700 hover:underline cursor-pointer bg-transparent border-0 p-0 m-0"
              onClick={() => handleStudentSelect(group)}
              style={{ background: "none" }}
            >
              {group.name}
            </button>
            <div className="text-sm text-gray-500 font-mono">
              {group.roll_numbers[0]}
            </div>
          </div>
        </TableCell>
        <TableCell className="align-middle text-left">
          <div className="text-sm font-medium text-gray-700">
            {group.course}
          </div>
        </TableCell>
        <TableCell className="align-middle text-left">
          <div className="text-sm font-medium text-gray-700">{group.caste}</div>
        </TableCell>
        <TableCell className="align-middle text-right">
          <div
            className={`flex items-center gap-1 px-3 py-1 rounded-lg transition-colors duration-200 justify-end w-fit ml-auto text-sm ${
              isDue
                ? "bg-red-100 border border-red-200 shadow text-red-700 font-bold"
                : "bg-gray-50 text-gray-400 font-medium"
            }`}
            style={{ minWidth: 70 }}
          >
            <IndianRupee
              className={`h-4 w-4 ${isDue ? "text-red-700" : "text-gray-400"}`}
            />
            <span
              className={
                isDue ? "text-red-700 font-bold" : "text-gray-500 font-medium"
              }
            >
              {totalDue.toLocaleString()}
            </span>
          </div>
        </TableCell>
        <TableCell className="w-12"></TableCell>
      </TableRow>
    );
  }
);

HostelRecordRow.displayName = "HostelRecordRow";

export default function HostelDues() {
  const { logout, accessToken } = useAuth();
  const [hostelDues, setHostelDues] = useState<HostelStudentGroup[]>([]);
  const [hostelStatistics, setHostelStatistics] =
    useState<HostelStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterLoading, setFilterLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [staffProfile, setStaffProfile] = useState<StaffProfile | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCourse, setSelectedCourse] = useState<string>("all");
  const [hasDuesFilter, setHasDuesFilter] = useState<string>("all");
  const [showHostelFilters, setShowHostelFilters] = useState(false);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [showStudentDetails, setShowStudentDetails] = useState(false);
  const [editingDue, setEditingDue] = useState<HostelDue | null>(null);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  // Function to fetch data with current filters
  const fetchData = async () => {
    try {
      setFilterLoading(true);
      const dues = await getHostelDues({
        student_name: debouncedSearchTerm,
        course: selectedCourse !== "all" ? selectedCourse : undefined,
      });

      if (Array.isArray(dues)) {
        setHostelDues(dues);

        // Calculate statistics
        const stats: HostelStatistics = {
          total_records: dues.length,
          records_with_dues: dues.filter((d) => d.due_amount > 0).length,
          records_without_dues: dues.filter((d) => d.due_amount === 0).length,
          total_due_amount: dues.reduce((sum, d) => sum + d.due_amount, 0),
          available_years: [1, 2, 3, 4, 5], // Default years
        };
        setHostelStatistics(stats);
      } else {
        setHostelDues([]);
        setHostelStatistics(null);
      }
      setError(null);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Failed to fetch data. Please try again later.");
    } finally {
      setFilterLoading(false);
    }
  };

  useEffect(() => {
    if (accessToken) {
      setLoading(true);
      fetchData().finally(() => setLoading(false));
    }
  }, [accessToken]);

  // Debounced search effect
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Effect to refetch data when filters change
  useEffect(() => {
    if (accessToken) {
      fetchData();
    }
  }, [debouncedSearchTerm, selectedCourse, accessToken]);

  useEffect(() => {
    const fetchStaffProfile = async () => {
      try {
        const profile = await getStaffProfile();
        setStaffProfile(profile);
        setError(null);
      } catch (error) {
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
      fetchStaffProfile();
    } else {
      setError("Please log in to view your profile");
    }
  }, [accessToken, logout]);

  const handleStudentSelect = (student: any) => {
    setSelectedStudent(student);
    setShowStudentDetails(true);
  };

  // Function to clear advanced filters
  const clearAdvancedFilters = () => {
    setHasDuesFilter("all");
  };

  // Function to clear all filters
  const clearAllFilters = () => {
    setSelectedCourse("all");
    setHasDuesFilter("all");
    setSearchTerm("");
    setShowHostelFilters(false);
  };

  // Handle advanced filters toggle
  const toggleAdvancedFilters = () => {
    if (showHostelFilters) {
      clearAdvancedFilters();
    }
    setShowHostelFilters(!showHostelFilters);
  };

  // Function to handle due update
  const handleUpdateDue = async (due: HostelDue) => {
    try {
      setUpdateLoading(true);
      setUpdateError(null);

      // Extract the numeric ID from the string ID
      const numericId = parseInt(due.id.split("_")[0]);

      const updatedDue = await updateHostelDue(numericId, {
        mess_bill: due.mess_bill,
        scholarship: due.scholarship,
        deposit: due.deposit,
        remarks: due.remarks,
      });

      // Refresh the data after update
      await fetchData();

      // Close the editing state
      setEditingDue(null);
    } catch (error) {
      console.error("Error updating hostel due:", error);
      if (error instanceof Error) {
        if (
          error.message.includes("session has expired") ||
          error.message.includes("Please log in again")
        ) {
          localStorage.removeItem("staffAccessToken");
          localStorage.removeItem("refreshToken");
          logout();
        } else {
          setUpdateError(error.message);
        }
      } else {
        setUpdateError("Failed to update due");
      }
    } finally {
      setUpdateLoading(false);
    }
  };

  // Filter groups based on search and course
  const filteredGroups = hostelDues.filter((group) => {
    const search = searchTerm.trim().toLowerCase();
    const matchesSearch =
      !search ||
      (group.roll_numbers[0]?.toLowerCase() || "").includes(search) ||
      (group.name?.toLowerCase() || "").includes(search);
    const matchesCourse =
      selectedCourse === "all" || group.course === selectedCourse;
    const matchesDuesFilter =
      hasDuesFilter === "all" ||
      (hasDuesFilter === "true" && group.due_amount > 0) ||
      (hasDuesFilter === "false" && group.due_amount === 0);

    return matchesSearch && matchesCourse && matchesDuesFilter;
  });

  // Debug logging
  console.log('HostelDues Debug:', {
    totalRecords: hostelDues.length,
    filteredRecords: filteredGroups.length,
    hasDuesFilter,
    searchTerm,
    selectedCourse,
    recordsWithDues: hostelDues.filter(d => d.due_amount > 0).length,
    recordsWithoutDues: hostelDues.filter(d => d.due_amount === 0).length
  });

  if (!accessToken) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <img
                src="/assets/Telangana_University_logo.png"
                alt="Telangana University Logo"
                className="h-10 w-10 object-contain"
              />
              <h1 className="text-xl font-bold text-gray-900 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Hostel Dues Management
              </h1>
            </div>

            <div className="flex items-center space-x-4">
              {/* User Profile Dropdown */}
              {staffProfile && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="relative h-9 px-3 rounded-lg hover:bg-blue-50"
                    >
                      <div className="flex items-center space-x-2">
                        <div className="h-7 w-7 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center">
                          <User className="h-4 w-4 text-white" />
                        </div>
                        <span className="hidden sm:inline text-sm font-medium text-gray-700">
                          {staffProfile.name}
                        </span>
                        <ChevronDown className="h-4 w-4 text-gray-400" />
                      </div>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal p-4 border-b border-gray-100 mb-2 bg-gray-50 rounded-t-lg">
                      <div className="flex flex-col gap-1">
                        <div className="font-bold text-gray-900 text-base">
                          {staffProfile.name}
                        </div>
                        <div className="text-xs text-gray-500 break-all whitespace-normal max-w-xs">
                          {staffProfile.email}
                        </div>
                        <div className="text-xs text-gray-500">
                          Department:{" "}
                          <span className="font-medium text-gray-700">
                            {staffProfile.department}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500">
                          Phone:{" "}
                          <span className="font-medium text-gray-700">
                            {staffProfile.phone_number}
                          </span>
                        </div>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={logout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {error && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="p-4 flex items-center text-red-700">
              <AlertCircle className="h-5 w-5 mr-2" />
              {error}
            </CardContent>
          </Card>
        )}

        {/* Statistics Cards */}
        {hostelStatistics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="border-0 shadow-lg bg-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Total Records
                </CardTitle>
                <BarChart3 className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">
                  {(
                    hostelStatistics.records_with_dues +
                    hostelStatistics.records_without_dues
                  ).toLocaleString()}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {hostelStatistics.records_with_dues} with dues,{" "}
                  {hostelStatistics.records_without_dues} without
                </p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-lg bg-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Records with Dues
                </CardTitle>
                <AlertCircle className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {hostelStatistics.records_with_dues.toLocaleString()}
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-lg bg-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Total Due Amount
                </CardTitle>
                <IndianRupee className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  ₹{hostelStatistics.total_due_amount.toLocaleString()}
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-lg bg-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Average Due
                </CardTitle>
                <Calendar className="h-4 w-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  ₹
                  {hostelStatistics.records_with_dues > 0
                    ? (
                        hostelStatistics.total_due_amount /
                        hostelStatistics.records_with_dues
                      ).toFixed(0)
                    : 0}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters */}
        <Card className="mb-6 border-0 shadow-lg bg-white">
          <CardHeader>
            <CardTitle className="text-gray-900">Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row md:items-end gap-4">
              <div className="w-full md:w-48">
                <Select
                  value={hasDuesFilter}
                  onValueChange={(value) => {
                    setHasDuesFilter(value);
                  }}
                >
                  <SelectTrigger className="border-gray-200 focus:border-blue-400 focus:ring-blue-400">
                    <SelectValue placeholder="All Records" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Records</SelectItem>
                    <SelectItem value="true">With Dues</SelectItem>
                    <SelectItem value="false">Without Dues</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="w-full md:w-64 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search by roll number or name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-gray-200 focus:border-blue-400 focus:ring-blue-400"
                />
                {searchTerm !== debouncedSearchTerm && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                  </div>
                )}
              </div>
              <div className="w-full md:w-48">
                <Select
                  value={selectedCourse}
                  onValueChange={(value) => {
                    setSelectedCourse(value);
                  }}
                >
                  <SelectTrigger className="border-gray-200 focus:border-blue-400 focus:ring-blue-400">
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
              </div>
              <div className="w-full md:w-44">
                <Button
                  variant="outline"
                  onClick={toggleAdvancedFilters}
                  className="flex items-center gap-2 border-gray-200 hover:bg-blue-50 hover:border-blue-300 w-full"
                >
                  <Filter className="h-4 w-4" />
                  Advanced Filters
                </Button>
              </div>
              <div className="w-full md:w-44">
                <Button
                  variant="outline"
                  onClick={clearAllFilters}
                  className="flex items-center gap-2 border-gray-200 hover:bg-red-50 hover:border-red-300 hover:text-red-600 w-full"
                >
                  <X className="h-4 w-4" />
                  Clear All Filters
                </Button>
              </div>
            </div>

            {/* Advanced Filters */}
            {showHostelFilters && (
              <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Min Amount
                    </label>
                    <Input
                      type="number"
                      placeholder="Min amount"
                      className="border-gray-200"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Max Amount
                    </label>
                    <Input
                      type="number"
                      placeholder="Max amount"
                      className="border-gray-200"
                    />
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Records Table */}
        <Card className="border-0 shadow-lg bg-white">
          <CardHeader>
            <CardTitle className="text-gray-900">Hostel Records</CardTitle>
          </CardHeader>
          <CardContent>
            {loading || filterLoading ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                <span className="ml-2 text-gray-600">
                  {filterLoading ? "Applying filters..." : "Loading records..."}
                </span>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-200 bg-gray-50">
                      <TableHead className="w-12"></TableHead>
                      <TableHead className="text-gray-600 font-semibold text-left">
                        Student Details
                      </TableHead>
                      <TableHead className="text-gray-600 font-semibold text-left">
                        Course
                      </TableHead>
                      <TableHead className="text-gray-600 font-semibold text-left">
                        Caste
                      </TableHead>
                      <TableHead className="text-gray-600 font-semibold text-right">
                        Due Amount
                      </TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredGroups.map((group) => (
                      <React.Fragment key={group.roll_numbers[0]}>
                        <HostelRecordRow
                          group={group}
                          handleStudentSelect={handleStudentSelect}
                        />
                        {expandedRows.has(group.roll_numbers[0]) && (
                          <TableRow>
                            <TableCell colSpan={6} className="p-0">
                              <div className="bg-gray-50 p-4">
                                <Table>
                                  <TableHeader>
                                    <TableRow className="bg-gray-100">
                                      <TableHead>Year</TableHead>
                                      <TableHead>Mess Bill</TableHead>
                                      <TableHead>Scholarship</TableHead>
                                      <TableHead>Deposit</TableHead>
                                      <TableHead>Remarks</TableHead>
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
                                          {due.year_of_study}
                                        </TableCell>
                                        <TableCell>
                                          {editingDue?.id === due.id ? (
                                            <Input
                                              type="number"
                                              value={editingDue.mess_bill}
                                              onChange={(e) =>
                                                setEditingDue({
                                                  ...editingDue,
                                                  mess_bill:
                                                    parseInt(e.target.value) ||
                                                    0,
                                                })
                                              }
                                              className="w-24"
                                            />
                                          ) : (
                                            `₹${due.mess_bill}`
                                          )}
                                        </TableCell>
                                        <TableCell>
                                          {editingDue?.id === due.id ? (
                                            <Input
                                              type="number"
                                              value={editingDue.scholarship}
                                              onChange={(e) =>
                                                setEditingDue({
                                                  ...editingDue,
                                                  scholarship:
                                                    parseInt(e.target.value) ||
                                                    0,
                                                })
                                              }
                                              className="w-24"
                                            />
                                          ) : (
                                            `₹${due.scholarship}`
                                          )}
                                        </TableCell>
                                        <TableCell>
                                          {editingDue?.id === due.id ? (
                                            <Input
                                              type="number"
                                              value={editingDue.deposit}
                                              onChange={(e) =>
                                                setEditingDue({
                                                  ...editingDue,
                                                  deposit:
                                                    parseInt(e.target.value) ||
                                                    0,
                                                })
                                              }
                                              className="w-24"
                                            />
                                          ) : (
                                            `₹${due.deposit}`
                                          )}
                                        </TableCell>
                                        <TableCell>
                                          {editingDue?.id === due.id ? (
                                            <Input
                                              value={editingDue.remarks}
                                              onChange={(e) =>
                                                setEditingDue({
                                                  ...editingDue,
                                                  remarks: e.target.value,
                                                })
                                              }
                                              className="w-32"
                                            />
                                          ) : (
                                            due.remarks
                                          )}
                                        </TableCell>
                                        <TableCell>
                                          {editingDue?.id === due.id ? (
                                            <div className="flex space-x-2">
                                              <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() =>
                                                  handleUpdateDue(editingDue)
                                                }
                                                disabled={updateLoading}
                                                className="bg-green-50 hover:bg-green-100 text-green-700 border-green-200 hover:border-green-300"
                                              >
                                                {updateLoading ? (
                                                  <Loader2 className="h-4 w-4 animate-spin" />
                                                ) : (
                                                  "Save"
                                                )}
                                              </Button>
                                              <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() =>
                                                  setEditingDue(null)
                                                }
                                                disabled={updateLoading}
                                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                              >
                                                Cancel
                                              </Button>
                                            </div>
                                          ) : (
                                            <Button
                                              variant="outline"
                                              size="sm"
                                              onClick={() => setEditingDue(due)}
                                              className="bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200 hover:border-blue-300"
                                            >
                                              Edit
                                            </Button>
                                          )}
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                                {updateError && (
                                  <div className="mt-2 text-sm text-red-600">
                                    {updateError}
                                  </div>
                                )}
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
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>Student Details</DialogTitle>
              <DialogDescription>
                View detailed information about the selected student.
              </DialogDescription>
            </DialogHeader>
            {selectedStudent && (
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-1">
                  <div className="flex flex-wrap gap-6">
                    <div className="flex items-center gap-2 min-w-[200px]">
                      <span className="text-gray-500 text-sm font-medium">
                        Name:
                      </span>
                      <span className="font-medium text-gray-900">
                        {selectedStudent.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 min-w-[200px]">
                      <span className="text-gray-500 text-sm font-medium">
                        Roll Number:
                      </span>
                      <span className="font-mono text-gray-900">
                        {selectedStudent.roll_numbers[0]}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 min-w-[200px]">
                      <span className="text-gray-500 text-sm font-medium">
                        Course:
                      </span>
                      <span className="text-gray-900">
                        {selectedStudent.course}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 min-w-[200px]">
                      <span className="text-gray-500 text-sm font-medium">
                        Phone:
                      </span>
                      <span className="text-gray-900">
                        {selectedStudent.phone_number}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 min-w-[200px]">
                      <span className="text-gray-500 text-sm font-medium">
                        Caste:
                      </span>
                      <span className="text-gray-900">
                        {selectedStudent.caste}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex-1 space-y-2">
                  <div className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-blue-600" />
                    Hostel Dues
                  </div>
                  <div className="grid gap-3">
                    {selectedStudent.dues.map((due: HostelDue) => {
                      const isDue = due.due_amount > 0;
                      return (
                        <div
                          key={due.id}
                          className="flex items-center justify-between p-3 bg-white rounded-xl border border-blue-200 shadow-sm hover:shadow-md transition-shadow"
                        >
                          <div className="flex flex-col gap-1">
                            <div className="font-semibold text-gray-900">
                              {due.year_of_study}
                            </div>
                            <div className="text-gray-500 text-sm">
                              Mess Bill: ₹{due.mess_bill} | Scholarship: ₹
                              {due.scholarship}
                            </div>
                          </div>
                          <div
                            className={`flex items-center gap-2 px-4 py-1 rounded-xl transition-colors duration-200 ${
                              isDue
                                ? "bg-red-100 border border-red-200 shadow text-red-700 font-extrabold text-lg"
                                : "bg-gray-50 text-gray-400 font-semibold"
                            }`}
                          >
                            <IndianRupee
                              className={`h-5 w-5 ${
                                isDue ? "text-red-700" : "text-gray-400"
                              }`}
                            />
                            <span
                              className={
                                isDue
                                  ? "text-red-700 font-extrabold text-lg"
                                  : "text-gray-500 font-semibold"
                              }
                            >
                              {due.due_amount}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
