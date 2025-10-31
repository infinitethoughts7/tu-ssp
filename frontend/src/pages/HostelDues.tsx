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
  ChevronDown,
  LogOut,
  IndianRupee,
  Calendar,
  Filter,
  BarChart3,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import axios from "axios";
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
  renewal_amount: number;
  remarks: string;
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
  batch: string;
  phone_number: string;
  deposit: number;
  renewal_amount: number;
  dues: HostelDue[];
  total_amount: number;
  due_amount: number; // This is the ONLY overall due amount
  // Year-wise data for detailed modal
  first_year_mess_bill?: number;
  second_year_mess_bill?: number;
  first_year_scholarship?: number;
  second_year_scholarship?: number;
  third_year_scholarship?: number;
  fourth_year_scholarship?: number;
  fifth_year_scholarship?: number;
}

interface HostelStatistics {
  total_records: number;
  records_with_dues: number;
  records_without_dues: number;
  total_due_amount: number;
  available_years: number[];
}

// Memoized table row component
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
          <div className="text-sm font-medium text-gray-700">{group.batch}</div>
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
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [showStudentDetails, setShowStudentDetails] = useState(false);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchData = async (page: number = currentPage) => {
    try {
      setFilterLoading(true);
      const response = await getHostelDues({
        student_name: debouncedSearchTerm,
        course: selectedCourse !== "all" ? selectedCourse : undefined,
        has_dues: hasDuesFilter !== "all" ? hasDuesFilter : undefined,
        page: page,
        page_size: pageSize,
      });

      const results = Array.isArray(response as any)
        ? (response as any)
        : (response as any).results || [];

      setHostelDues(results);

      // Update pagination info
      if ((response as any).total_pages !== undefined) {
        setTotalPages((response as any).total_pages);
        setTotalCount((response as any).count);
        setCurrentPage((response as any).current_page);
      }

      const providedStats = (response as any).statistics;
      if (providedStats) {
        setHostelStatistics({
          total_records: providedStats.total_records,
          records_with_dues: providedStats.records_with_dues,
          records_without_dues: providedStats.records_without_dues,
          total_due_amount: providedStats.total_due_amount,
          available_years: [1, 2, 3, 4, 5],
        });
      } else {
        const stats: HostelStatistics = {
          total_records: results.length,
          records_with_dues: results.filter((d: any) => d.due_amount > 0)
            .length,
          records_without_dues: results.filter((d: any) => d.due_amount === 0)
            .length,
          total_due_amount: results.reduce(
            (sum: number, d: any) => sum + d.due_amount,
            0
          ),
          available_years: [1, 2, 3, 4, 5],
        };
        setHostelStatistics(stats);
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
      setCurrentPage(1);
      fetchData(1).finally(() => setLoading(false));
    }
  }, [accessToken]);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    if (accessToken) {
      setCurrentPage(1);
      fetchData(1);
    }
  }, [debouncedSearchTerm, selectedCourse, hasDuesFilter, accessToken]);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    fetchData(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

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

  const clearAdvancedFilters = () => {
    setHasDuesFilter("all");
  };

  const clearAllFilters = () => {
    setSelectedCourse("all");
    setHasDuesFilter("all");
    setSearchTerm("");
    setShowHostelFilters(false);
  };

  const toggleAdvancedFilters = () => {
    if (showHostelFilters) {
      clearAdvancedFilters();
    }
    setShowHostelFilters(!showHostelFilters);
  };

  // No client-side filtering needed - all filtering is server-side
  const filteredGroups = hostelDues;

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
                    setCurrentPage(1); // Reset to first page on filter change
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
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1); // Reset to first page on search
                  }}
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
                    setCurrentPage(1); // Reset to first page on filter change
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
                  onClick={clearAllFilters}
                  className="flex items-center gap-2 border-gray-200 hover:bg-red-50 hover:border-red-300 hover:text-red-600 w-full"
                >
                  <X className="h-4 w-4" />
                  Clear All Filters
                </Button>
              </div>
            </div>
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
                        Batch
                      </TableHead>
                      <TableHead className="text-gray-600 font-semibold text-right">
                        Due Amount
                      </TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredGroups.map((group) => (
                      <HostelRecordRow
                        key={group.roll_numbers[0]}
                        group={group}
                        handleStudentSelect={handleStudentSelect}
                      />
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {/* Pagination Controls */}
            {!loading && !filterLoading && totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 px-2">
                <div className="text-sm text-gray-600">
                  Showing {(currentPage - 1) * pageSize + 1} to{" "}
                  {Math.min(currentPage * pageSize, totalCount)} of {totalCount}{" "}
                  records
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1 || filterLoading}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      return (
                        <Button
                          key={pageNum}
                          variant={
                            currentPage === pageNum ? "default" : "outline"
                          }
                          size="sm"
                          onClick={() => handlePageChange(pageNum)}
                          disabled={filterLoading}
                          className="w-10"
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages || filterLoading}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Student Details Modal */}
        <Dialog open={showStudentDetails} onOpenChange={setShowStudentDetails}>
          <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-hidden">
            <DialogHeader>
              <DialogTitle>Student Details</DialogTitle>
              <DialogDescription>
                View detailed information about the selected student.
              </DialogDescription>
            </DialogHeader>
            {selectedStudent && (
              <div className="space-y-6 max-h-[70vh] overflow-y-auto">
                {/* Student Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-gray-500">Name:</span>
                    <div className="font-semibold text-gray-900">
                      {selectedStudent.name}
                    </div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Roll Number:</span>
                    <div className="font-mono text-gray-900">
                      {selectedStudent.roll_numbers[0]}
                    </div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Course:</span>
                    <div className="text-gray-900">
                      {selectedStudent.course}
                    </div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Batch:</span>
                    <div className="text-gray-900">{selectedStudent.batch}</div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Phone:</span>
                    <div className="text-gray-900">
                      {selectedStudent.phone_number}
                    </div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Caste:</span>
                    <div className="text-gray-900">{selectedStudent.caste}</div>
                  </div>
                </div>

                {/* Payment Summary */}
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Payment Summary
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm text-gray-600">Deposit:</span>
                      <div className="text-lg font-bold text-blue-700">
                        ₹{selectedStudent.deposit?.toLocaleString() || 0}
                      </div>
                    </div>
                    {selectedStudent.renewal_amount > 0 && (
                      <div>
                        <span className="text-sm text-gray-600">
                          Renewal Amount:
                        </span>
                        <div className="text-lg font-bold text-blue-700">
                          ₹
                          {selectedStudent.renewal_amount?.toLocaleString() ||
                            0}
                        </div>
                      </div>
                    )}
                    <div>
                      <span className="text-sm text-gray-600">
                        Total Due Amount:
                      </span>
                      <div className="text-lg font-bold text-red-700">
                        ₹{selectedStudent.due_amount?.toLocaleString() || 0}
                      </div>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">
                        Total Mess Bill:
                      </span>
                      <div className="text-lg font-bold text-gray-700">
                        ₹{selectedStudent.total_amount?.toLocaleString() || 0}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Year-wise Details */}
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Year-wise Details
                  </h3>
                  <div className="space-y-4">
                    {/* First Year */}
                    <div className="bg-white p-4 rounded border border-gray-200">
                      <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        First Year
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="text-sm text-gray-600">
                            Mess Bill:
                          </span>
                          <div className="font-semibold text-gray-900">
                            ₹
                            {(
                              (selectedStudent.first_year_mess_bill as number) ||
                              0
                            ).toLocaleString()}
                          </div>
                        </div>
                        <div>
                          <span className="text-sm text-gray-600">
                            Scholarship:
                          </span>
                          <div className="font-semibold text-green-700">
                            ₹
                            {(
                              (selectedStudent.first_year_scholarship as number) ||
                              0
                            ).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Second Year */}
                    {(selectedStudent.second_year_mess_bill > 0 ||
                      selectedStudent.second_year_scholarship > 0) && (
                      <div className="bg-white p-4 rounded border border-gray-200">
                        <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          Second Year
                        </h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <span className="text-sm text-gray-600">
                              Mess Bill:
                            </span>
                            <div className="font-semibold text-gray-900">
                              ₹
                              {(
                                (selectedStudent.second_year_mess_bill as number) ||
                                0
                              ).toLocaleString()}
                            </div>
                          </div>
                          <div>
                            <span className="text-sm text-gray-600">
                              Scholarship:
                            </span>
                            <div className="font-semibold text-green-700">
                              ₹
                              {(
                                (selectedStudent.second_year_scholarship as number) ||
                                0
                              ).toLocaleString()}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Third Year */}
                    {(selectedStudent.third_year_scholarship as number) > 0 && (
                      <div className="bg-white p-4 rounded border border-gray-200">
                        <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          Third Year
                        </h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <span className="text-sm text-gray-600">
                              Scholarship:
                            </span>
                            <div className="font-semibold text-green-700">
                              ₹
                              {(
                                (selectedStudent.third_year_scholarship as number) ||
                                0
                              ).toLocaleString()}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Fourth Year */}
                    {(selectedStudent.fourth_year_scholarship as number) >
                      0 && (
                      <div className="bg-white p-4 rounded border border-gray-200">
                        <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          Fourth Year
                        </h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <span className="text-sm text-gray-600">
                              Scholarship:
                            </span>
                            <div className="font-semibold text-green-700">
                              ₹
                              {(
                                (selectedStudent.fourth_year_scholarship as number) ||
                                0
                              ).toLocaleString()}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Fifth Year */}
                    {(selectedStudent.fifth_year_scholarship as number) > 0 && (
                      <div className="bg-white p-4 rounded border border-gray-200">
                        <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          Fifth Year
                        </h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <span className="text-sm text-gray-600">
                              Scholarship:
                            </span>
                            <div className="font-semibold text-green-700">
                              ₹
                              {(
                                (selectedStudent.fifth_year_scholarship as number) ||
                                0
                              ).toLocaleString()}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
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
