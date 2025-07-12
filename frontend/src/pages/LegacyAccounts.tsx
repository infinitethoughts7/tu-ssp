import React, { useEffect, useState } from "react";
import { useAuth } from "../context/useAuth";
import {
  getLegacyRecordsPaginated,
  getLegacyStatistics,
  getStaffProfile,
  LegacyFilters,
  LegacyStatistics,
  PaginatedLegacyResponse,
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
import type { LegacyStudentGroup } from "../types/staffDashboardTypes";
import { COURSE_OPTIONS } from "../types/constants";

interface StaffProfile {
  name: string;
  designation: string;
  department: string;
  phone_number: string;
  email: string;
  gender?: string;
}

// Memoized table row component for better performance
const LegacyRecordRow = React.memo(
  ({
    group,
    expandedRows,
    setExpandedRows,
    handleStudentSelect,
  }: {
    group: LegacyStudentGroup;
    expandedRows: Set<string>;
    setExpandedRows: React.Dispatch<React.SetStateAction<Set<string>>>;
    handleStudentSelect: (student: any) => void;
  }) => {
    const isExpanded = expandedRows.has(group.roll_numbers[0]);

    return (
      <React.Fragment>
        <TableRow className="hover:bg-blue-50/50 transition-colors">
          <TableCell className="w-12">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 hover:bg-blue-100"
              onClick={() => {
                const newExpandedRows = new Set(expandedRows);
                if (newExpandedRows.has(group.roll_numbers[0])) {
                  newExpandedRows.delete(group.roll_numbers[0]);
                } else {
                  newExpandedRows.add(group.roll_numbers[0]);
                }
                setExpandedRows(newExpandedRows);
              }}
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4 text-blue-600" />
              ) : (
                <ChevronRight className="h-4 w-4 text-blue-600" />
              )}
            </Button>
          </TableCell>
          <TableCell>
            <div className="space-y-1">
              <div className="font-semibold text-gray-900">{group.name}</div>
              <div className="text-sm text-gray-500 font-mono">
                {group.roll_numbers[0]}
              </div>
            </div>
          </TableCell>
          <TableCell>
            <div className="text-sm font-medium text-gray-700">
              {group.course}
            </div>
          </TableCell>
          <TableCell>
            {(() => {
              const totalDue = group.dues.reduce(
                (sum, due) => sum + (Number(due.due_amount) || 0),
                0
              );
              const isDue = totalDue > 0;
              return (
                <div
                  className={`flex items-center gap-2 px-5 py-2 rounded-xl transition-colors duration-200 justify-center w-fit mx-auto ${
                    isDue
                      ? "bg-red-100 border border-red-200 shadow text-red-700 font-extrabold text-xl"
                      : "bg-gray-50 text-gray-400 font-semibold"
                  }`}
                >
                  <IndianRupee
                    className={`h-6 w-6 ${
                      isDue ? "text-red-700" : "text-gray-400"
                    }`}
                  />
                  <span
                    className={`${
                      isDue
                        ? "text-red-700 font-extrabold text-xl"
                        : "text-gray-500 font-semibold"
                    }`}
                  >
                    {totalDue.toLocaleString()}
                  </span>
                </div>
              );
            })()}
          </TableCell>
          <TableCell className="w-12">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 hover:bg-blue-100"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleStudentSelect(group)}>
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem>Export Data</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </TableCell>
        </TableRow>
        {isExpanded && (
          <TableRow>
            <TableCell colSpan={5} className="p-0">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 border-t border-blue-200">
                <div className="space-y-4">
                  <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-blue-600" />
                    Due Records
                  </h4>
                  <div className="grid gap-3">
                    {group.dues.map((legacyDue) => {
                      const isDue = Number(legacyDue.due_amount) > 0;
                      return (
                        <div
                          key={legacyDue.id}
                          className="flex items-center justify-between p-4 bg-white rounded-xl border border-blue-200 shadow-sm hover:shadow-md transition-shadow"
                        >
                          <div className="flex flex-col gap-1">
                            <div className="font-semibold text-gray-900">
                              TC: {legacyDue.tc_number || "N/A"}
                            </div>
                            <div className="text-gray-500 text-sm">
                              TC Date:{" "}
                              {legacyDue.tc_issued_date
                                ? format(
                                    new Date(legacyDue.tc_issued_date),
                                    "dd MMM yyyy"
                                  )
                                : "N/A"}
                            </div>
                            <div className="text-gray-500 text-sm">
                              Caste: {group.caste || "N/A"}
                            </div>
                            <div className="text-gray-500 text-sm">
                              Phone: {group.phone_number || "N/A"}
                            </div>
                            <div className="text-gray-500 text-sm">
                              Batch: {legacyDue.student.batch || "N/A"}
                            </div>
                          </div>
                          <div
                            className={`flex items-center gap-2 px-5 py-2 rounded-xl transition-colors duration-200 ${
                              isDue
                                ? "bg-red-100 border border-red-200 shadow text-red-700 font-extrabold text-xl"
                                : "bg-gray-50 text-gray-400 font-semibold"
                            }`}
                          >
                            <IndianRupee
                              className={`h-6 w-6 ${
                                isDue ? "text-red-700" : "text-gray-400"
                              }`}
                            />
                            <span
                              className={`${
                                isDue
                                  ? "text-red-700 font-extrabold text-xl"
                                  : "text-gray-500 font-semibold"
                              }`}
                            >
                              {legacyDue.due_amount}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </TableCell>
          </TableRow>
        )}
      </React.Fragment>
    );
  }
);

LegacyRecordRow.displayName = "LegacyRecordRow";

export default function LegacyAccounts() {
  const { logout, accessToken } = useAuth();
  const [legacyRecords, setLegacyRecords] = useState<LegacyStudentGroup[]>([]);
  const [legacyStatistics, setLegacyStatistics] =
    useState<LegacyStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterLoading, setFilterLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [staffProfile, setStaffProfile] = useState<StaffProfile | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCourse, setSelectedCourse] = useState<string>("all");
  const [selectedYear, setSelectedYear] = useState<string>("all");
  const [hasDuesFilter, setHasDuesFilter] = useState<string>("all");
  const [legacyFilters, setLegacyFilters] = useState<LegacyFilters>({});
  const [showLegacyFilters, setShowLegacyFilters] = useState(false);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [showStudentDetails, setShowStudentDetails] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(50);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [paginationData, setPaginationData] =
    useState<PaginatedLegacyResponse | null>(null);

  // Function to fetch data with current filters
  const fetchData = async (filters: LegacyFilters, page: number = 1) => {
    try {
      setFilterLoading(true);
      const [legacyData, legacyStats] = await Promise.all([
        getLegacyRecordsPaginated(filters, page, itemsPerPage),
        getLegacyStatistics(filters),
      ]);

      if (legacyData) {
        setLegacyRecords(legacyData.results);
        setPaginationData(legacyData);
      } else {
        setLegacyRecords([]);
        setPaginationData(null);
      }
      setLegacyStatistics(legacyStats);
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
      fetchData(legacyFilters, currentPage).finally(() => setLoading(false));
    }
  }, [accessToken]);

  // Debounced search effect
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(1); // Reset to first page when searching

      // Update filters with search term
      const newFilters = { ...legacyFilters };
      if (searchTerm.trim()) {
        newFilters.student_name = searchTerm.trim();
      } else {
        delete newFilters.student_name;
      }
      setLegacyFilters(newFilters);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Effect to refetch data when filters change
  useEffect(() => {
    if (accessToken) {
      fetchData(legacyFilters, currentPage);
    }
  }, [legacyFilters, currentPage, accessToken]);

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

  const handleLegacyFilterChange = (filters: Partial<LegacyFilters>) => {
    const newFilters = { ...legacyFilters, ...filters };
    setLegacyFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleStudentSelect = (student: any) => {
    setSelectedStudent(student);
    setShowStudentDetails(true);
  };

  // Function to clear advanced filters
  const clearAdvancedFilters = () => {
    const newFilters = { ...legacyFilters };
    delete newFilters.min_amount;
    delete newFilters.max_amount;
    // Remove has_dues filter to show all records
    delete newFilters.has_dues;
    setLegacyFilters(newFilters);
    // Reset the hasDuesFilter state to "all"
    setHasDuesFilter("all");
  };

  // Function to clear all filters
  const clearAllFilters = () => {
    setLegacyFilters({});
    setHasDuesFilter("all");
    setSelectedCourse("all");
    setSelectedYear("all");
    setSearchTerm("");
    setCurrentPage(1);
  };

  // Handle advanced filters toggle
  const toggleAdvancedFilters = () => {
    if (showLegacyFilters) {
      // If closing, clear the advanced filter values
      clearAdvancedFilters();
    }
    setShowLegacyFilters(!showLegacyFilters);
  };

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
                Students Academic Dues
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
                        <span className="text-sm font-medium text-gray-700">
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
        {legacyStatistics && (
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
                    legacyStatistics.records_with_dues +
                    legacyStatistics.records_without_dues
                  ).toLocaleString()}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {legacyStatistics.records_with_dues} with dues,{" "}
                  {legacyStatistics.records_without_dues} without
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
                  {legacyStatistics.records_with_dues.toLocaleString()}
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
                  ₹{legacyStatistics.total_due_amount.toLocaleString()}
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-lg bg-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  TC Issued
                </CardTitle>
                <Calendar className="h-4 w-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  {legacyStatistics.tc_issued_count.toLocaleString()}
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
                    setLegacyFilters((prev) => {
                      const newFilters = { ...prev };
                      if (value === "all") {
                        delete newFilters.has_dues;
                      } else if (value === "true") {
                        newFilters.has_dues = true;
                      } else if (value === "false") {
                        newFilters.has_dues = false;
                      }
                      return newFilters;
                    });
                    setCurrentPage(1);
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
                    if (value === "all") {
                      handleLegacyFilterChange({ course: undefined });
                    } else {
                      handleLegacyFilterChange({ course: value });
                    }
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
              {legacyStatistics && (
                <div className="w-full md:w-48">
                  <Select
                    value={selectedYear}
                    onValueChange={(value) => {
                      setSelectedYear(value);
                      if (value === "all") {
                        handleLegacyFilterChange({ year: undefined });
                      } else {
                        handleLegacyFilterChange({ year: parseInt(value) });
                      }
                    }}
                  >
                    <SelectTrigger className="border-gray-200 focus:border-blue-400 focus:ring-blue-400">
                      <SelectValue placeholder="All Years" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Years</SelectItem>
                      {legacyStatistics.available_years.map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
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
            {showLegacyFilters && (
              <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Min Amount
                    </label>
                    <Input
                      type="number"
                      placeholder="Min amount"
                      value={legacyFilters.min_amount || ""}
                      onChange={(e) => {
                        const value = e.target.value
                          ? parseFloat(e.target.value)
                          : undefined;
                        handleLegacyFilterChange({ min_amount: value });
                      }}
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
                      value={legacyFilters.max_amount || ""}
                      onChange={(e) => {
                        const value = e.target.value
                          ? parseFloat(e.target.value)
                          : undefined;
                        handleLegacyFilterChange({ max_amount: value });
                      }}
                      className="border-gray-200"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Pagination */}
            {paginationData && paginationData.total_pages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
                <div className="text-sm text-gray-600">
                  Showing {paginationData?.results?.length || 0} of{" "}
                  {paginationData?.count || 0} results
                  {paginationData && (
                    <span className="ml-2">
                      (Page {paginationData.current_page} of{" "}
                      {paginationData.total_pages})
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={!paginationData?.has_previous}
                    className="border-gray-200 hover:bg-blue-50 hover:border-blue-300"
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-gray-600 px-3">
                    Page {currentPage} of {paginationData.total_pages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentPage(
                        Math.min(paginationData.total_pages, currentPage + 1)
                      )
                    }
                    disabled={!paginationData?.has_next}
                    className="border-gray-200 hover:bg-blue-50 hover:border-blue-300"
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Records Table */}
        <Card className="border-0 shadow-lg bg-white">
          <CardHeader>
            <CardTitle className="text-gray-900">
              Legacy Academic Records
            </CardTitle>
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
                      <TableHead className="w-12 text-gray-600 font-semibold"></TableHead>
                      <TableHead className="text-gray-600 font-semibold">
                        Student Details
                      </TableHead>
                      <TableHead className="text-gray-600 font-semibold">
                        Course
                      </TableHead>
                      <TableHead className="text-gray-600 font-semibold">
                        Due Amount
                      </TableHead>
                      <TableHead className="w-12 text-gray-600 font-semibold"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {legacyRecords.map((group) => (
                      <LegacyRecordRow
                        key={group.roll_numbers[0]}
                        group={group}
                        expandedRows={expandedRows}
                        setExpandedRows={setExpandedRows}
                        handleStudentSelect={handleStudentSelect}
                      />
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
                    <p className="font-medium text-gray-900">
                      {selectedStudent.name}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Roll Number</p>
                    <p className="font-medium text-gray-900 font-mono">
                      {selectedStudent.roll_numbers[0]}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Course</p>
                    <p className="font-medium text-gray-900">
                      {selectedStudent.course}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Phone Number</p>
                    <p className="font-medium text-gray-900">
                      {selectedStudent.phone_number}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-gray-500">Total Records</p>
                    <p className="font-medium text-red-600">
                      {selectedStudent.dues.length} records
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
}
