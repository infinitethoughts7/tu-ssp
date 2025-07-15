import React, { useEffect, useState } from "react";
import { useAuth } from "../context/useAuth";
import {
  getGroupedLibraryRecords,
  updateLibraryFine,
  getStaffProfile,
  StaffProfile,
} from "../services/departmentService";
import {
  LibraryRecord,
  LibraryStudentGroup,
} from "../types/staffDashboardTypes";
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
  BookOpen,
  Hash,
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

// Memoized table row component for better performance
const LibraryRecordRow = React.memo(
  ({
    group,
    expandedRows,
    setExpandedRows,
    handleStudentSelect,
    onAssignFine,
  }: {
    group: any;
    expandedRows: Set<string>;
    setExpandedRows: React.Dispatch<React.SetStateAction<Set<string>>>;
    handleStudentSelect: (student: any) => void;
    onAssignFine: (recordId: number, currentFine: number) => void;
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
          {/* Removed caste column */}
          <TableCell>
            {(() => {
              const totalFine = group.total_fine_amount;
              const hasFine = totalFine > 0;
              return (
                <div
                  className={`flex items-center gap-2 px-5 py-2 rounded-xl transition-colors duration-200 justify-center w-fit mx-auto ${
                    hasFine
                      ? "bg-red-100 border border-red-200 shadow text-red-700 font-extrabold text-xl"
                      : "bg-gray-50 text-gray-400 font-semibold"
                  }`}
                >
                  <IndianRupee
                    className={`h-6 w-6 ${
                      hasFine ? "text-red-700" : "text-gray-400"
                    }`}
                  />
                  <span
                    className={`${
                      hasFine
                        ? "text-red-700 font-extrabold text-xl"
                        : "text-gray-500 font-semibold"
                    }`}
                  >
                    {totalFine.toLocaleString()}
                  </span>
                </div>
              );
            })()}
          </TableCell>
          <TableCell>
            <div className="text-sm text-gray-600">
              {group.records.length} books
            </div>
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
            <TableCell colSpan={6} className="p-0">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 border-t border-blue-200">
                <div className="space-y-4">
                  <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-blue-600" />
                    Library Records
                  </h4>
                  <div className="grid gap-3">
                    {group.records.map((record: any) => {
                      const hasFine = parseFloat(record.fine_amount) > 0;
                      return (
                        <div
                          key={record.id}
                          className="flex items-center justify-between p-3 bg-white rounded-xl border border-blue-200 shadow-sm hover:shadow-md transition-shadow"
                        >
                          <div className="flex flex-col gap-1">
                            <div className="font-semibold text-gray-900 font-mono">
                              Book ID: {record.book_id}
                            </div>
                            <div className="text-gray-500 text-sm">
                              Borrowed:{" "}
                              {format(
                                new Date(record.borrowing_date),
                                "dd MMM yyyy"
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div
                              className={`flex items-center gap-2 px-4 py-1 rounded-xl transition-colors duration-200 ${
                                hasFine
                                  ? "bg-red-100 border border-red-200 shadow text-red-700 font-extrabold text-xl"
                                  : "bg-gray-50 text-gray-400 font-semibold"
                              }`}
                            >
                              <IndianRupee
                                className={`h-5 w-5 ${
                                  hasFine ? "text-red-700" : "text-gray-400"
                                }`}
                              />
                              <span
                                className={`${
                                  hasFine
                                    ? "text-red-700 font-extrabold text-xl"
                                    : "text-gray-500 font-semibold"
                                }`}
                              >
                                {parseFloat(
                                  record.fine_amount
                                ).toLocaleString()}
                              </span>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              className="ml-2"
                              onClick={() =>
                                onAssignFine(
                                  record.id,
                                  parseFloat(record.fine_amount)
                                )
                              }
                            >
                              Assign Fine
                            </Button>
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

LibraryRecordRow.displayName = "LibraryRecordRow";

export default function LibraryRecords() {
  const { logout, accessToken } = useAuth();
  const [groupedRecords, setGroupedRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterLoading, setFilterLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [staffProfile, setStaffProfile] = useState<StaffProfile | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCourse, setSelectedCourse] = useState<string>("all");
  const [hasFineFilter, setHasFineFilter] = useState<string>("all");
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [showStudentDetails, setShowStudentDetails] = useState(false);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  // Add state for selectedYear
  const [selectedYear, setSelectedYear] = useState<string>("all");
  const [assignFineDialog, setAssignFineDialog] = useState<{
    open: boolean;
    recordId: number | null;
    currentFine: number;
  }>({ open: false, recordId: null, currentFine: 0 });
  const [assignFineValue, setAssignFineValue] = useState<string>("");
  const [assignFineLoading, setAssignFineLoading] = useState(false);

  // Function to group library records by student
  const groupLibraryRecordsByStudent = (
    records: LibraryRecord[]
  ): LibraryStudentGroup[] => {
    if (!Array.isArray(records)) {
      console.error("Invalid library records data:", records);
      return [];
    }

    const grouped = records.reduce(
      (acc: Record<string, LibraryStudentGroup>, record) => {
        if (!record.student.user.username) {
          console.warn("Skipping record with missing username:", record);
          return acc;
        }
        const key = record.student.user.username;
        if (!acc[key]) {
          acc[key] = {
            roll_numbers: [record.student.user.username],
            name:
              `${record.student.user.first_name} ${record.student.user.last_name}`.trim() ||
              "N/A",
            course: record.student.course_name || "N/A",
            caste: record.student.caste || "N/A",
            phone_number: record.student.mobile_number || "N/A",
            records: [],
            total_fine_amount: 0,
            user: {
              username: record.student.user.username,
              first_name: record.student.user.first_name,
              last_name: record.student.user.last_name,
            },
          };
        }
        acc[key].records.push(record);
        acc[key].total_fine_amount += parseFloat(record.fine_amount) || 0;
        return acc;
      },
      {}
    );

    return Object.values(grouped);
  };

  // Extract unique batch years from all records, descending order
  const allBatchYears = Array.from(
    new Set(
      groupedRecords.map((r) => r.records[0]?.student.batch).filter(Boolean)
    )
  )
    .sort()
    .reverse();

  // Filter and group records
  const filteredGroups = groupedRecords.filter((group) => {
    // ...apply search, course, fine, year filters as before, but on group.records[0].student
    const firstRecord = group.records[0];
    if (!firstRecord) return false;
    const search = searchTerm.trim().toLowerCase();
    const matchesSearch =
      !search ||
      (group.roll_numbers[0]?.toLowerCase() || "").includes(search) ||
      (group.name?.toLowerCase() || "").includes(search) ||
      group.records.some((r: any) =>
        (r.book_id?.toLowerCase() || "").includes(search)
      );
    const matchesCourse =
      selectedCourse === "all" ||
      firstRecord.student.course_name === selectedCourse;
    const matchesFineFilter = (() => {
      if (hasFineFilter === "all") return true;
      if (hasFineFilter === "true") return group.total_fine_amount > 0;
      if (hasFineFilter === "false") return group.total_fine_amount === 0;
      return true;
    })();
    const matchesYear =
      selectedYear === "all" || firstRecord.student.batch === selectedYear;
    return matchesSearch && matchesCourse && matchesFineFilter && matchesYear;
  });

  // Calculate statistics
  const statistics = {
    totalRecords: filteredGroups.reduce(
      (sum, group) => sum + group.records.length,
      0
    ),
    totalStudents: filteredGroups.length,
    totalFineAmount: filteredGroups.reduce(
      (sum, group) => sum + group.total_fine_amount,
      0
    ),
    studentsWithFines: filteredGroups.filter(
      (group) => group.total_fine_amount > 0
    ).length,
  };

  // Fetch grouped records on mount/refresh
  useEffect(() => {
    const fetchGrouped = async () => {
      setLoading(true);
      try {
        if (!accessToken) {
          console.log("No access token found, redirecting to login");
          return;
        }

        const storedDepartment = localStorage.getItem("department");
        if (
          !storedDepartment ||
          (storedDepartment.toLowerCase() !== "library" &&
            storedDepartment.toLowerCase() !== "library_staff" &&
            storedDepartment.toLowerCase() !== "librarian")
        ) {
          console.log(
            "Invalid department for library records:",
            storedDepartment
          );
          return;
        }

        const profile = await getStaffProfile();
        setStaffProfile(profile);

        const data = await getGroupedLibraryRecords();
        setGroupedRecords(data);
        setError(null);
      } catch (e: any) {
        setError(e.message || "Failed to fetch grouped records");
      } finally {
        setLoading(false);
      }
    };
    fetchGrouped();
  }, [accessToken]);

  // Debounced search effect
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleStudentSelect = (student: any) => {
    setSelectedStudent(student);
    setShowStudentDetails(true);
  };

  // Function to clear all filters
  const clearAllFilters = () => {
    setHasFineFilter("all");
    setSelectedCourse("all");
    setSearchTerm("");
    setSelectedYear("all"); // Clear year filter
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
                Library Records Dashboard
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 shadow-lg bg-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Records
              </CardTitle>
              <BookOpen className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {statistics.totalRecords.toLocaleString()}
              </div>
              <p className="text-xs text-gray-500 mt-1">Library book records</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg bg-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Students with Records
              </CardTitle>
              <User className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {statistics.totalStudents.toLocaleString()}
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg bg-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Students with Fines
              </CardTitle>
              <AlertCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {statistics.studentsWithFines.toLocaleString()}
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg bg-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Fine Amount
              </CardTitle>
              <IndianRupee className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                ₹{statistics.totalFineAmount.toLocaleString()}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6 border-0 shadow-lg bg-white">
          <CardHeader>
            <CardTitle className="text-gray-900">Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row md:items-end gap-4">
              <div className="w-full md:w-48">
                <Select value={hasFineFilter} onValueChange={setHasFineFilter}>
                  <SelectTrigger className="border-gray-200 focus:border-blue-400 focus:ring-blue-400">
                    <SelectValue placeholder="All Records" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem key="all" value="all">
                      All Records
                    </SelectItem>
                    <SelectItem key="true" value="true">
                      With Fines
                    </SelectItem>
                    <SelectItem key="false" value="false">
                      Without Fines
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="w-full md:w-64 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search by roll number, name, or book ID..."
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
                  onValueChange={setSelectedCourse}
                >
                  <SelectTrigger className="border-gray-200 focus:border-blue-400 focus:ring-blue-400">
                    <SelectValue placeholder="All Courses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem key="all" value="all">
                      All Courses
                    </SelectItem>
                    {COURSE_OPTIONS.map((course) => (
                      <SelectItem key={course} value={course}>
                        {course}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="w-full md:w-48">
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger className="border-gray-200 focus:border-blue-400 focus:ring-blue-400">
                    <SelectValue placeholder="All Years" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem key="all" value="all">
                      All Years
                    </SelectItem>
                    {allBatchYears.map((year) => (
                      <SelectItem key={year} value={year}>
                        {year}
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
            <CardTitle className="text-gray-900">
              Library Records ({filteredGroups.length} students)
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
            ) : filteredGroups.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                <BookOpen className="h-16 w-16 mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No library records found
                </h3>
                <p className="text-sm text-gray-500 text-center">
                  {searchTerm ||
                  selectedCourse !== "all" ||
                  hasFineFilter !== "all" ||
                  selectedYear !== "all"
                    ? "Try adjusting your search criteria."
                    : "No library records are available."}
                </p>
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
                        Total Fine
                      </TableHead>
                      <TableHead className="text-gray-600 font-semibold">
                        Records
                      </TableHead>
                      <TableHead className="w-12 text-gray-600 font-semibold"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredGroups.map((group) => (
                      <LibraryRecordRow
                        key={group.roll_numbers[0]}
                        group={group}
                        expandedRows={expandedRows}
                        setExpandedRows={setExpandedRows}
                        handleStudentSelect={handleStudentSelect}
                        onAssignFine={(recordId, currentFine) => {
                          setAssignFineDialog({
                            open: true,
                            recordId,
                            currentFine,
                          });
                          setAssignFineValue(currentFine.toString());
                        }}
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
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>Student Details</DialogTitle>
              <DialogDescription>
                View detailed information about the selected student's library
                records.
              </DialogDescription>
            </DialogHeader>
            {selectedStudent && (
              <div className="space-y-6">
                {/* Student Information */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-3">
                    Student Information
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Name:</span>
                      <span className="ml-2 font-medium">
                        {selectedStudent.name}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Roll Number:</span>
                      <span className="ml-2 font-mono">
                        {selectedStudent.roll_numbers[0]}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Course:</span>
                      <span className="ml-2">{selectedStudent.course}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Batch:</span>
                      <span className="ml-2">
                        {selectedStudent.records[0]?.student.batch || "N/A"}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Phone:</span>
                      <span className="ml-2">
                        {selectedStudent.phone_number}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Total Fine:</span>
                      <span className="ml-2 font-medium text-red-600">
                        ₹{selectedStudent.total_fine_amount.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Library Records */}
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">
                    Library Records ({selectedStudent.records.length})
                  </h3>
                  <div className="space-y-3">
                    {selectedStudent.records.map((record: LibraryRecord) => (
                      <div
                        key={record.id}
                        className="border rounded-lg p-4 bg-white"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                              <Hash className="h-4 w-4 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-mono text-sm text-gray-900">
                                {record.book_id}
                              </p>
                              <div className="flex items-center space-x-4 text-xs text-gray-500">
                                <div className="flex items-center space-x-1">
                                  <Calendar className="h-3 w-3" />
                                  <span>
                                    Borrowed:{" "}
                                    {format(
                                      new Date(record.borrowing_date),
                                      "dd MMM yyyy"
                                    )}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-red-600">
                              ₹{parseFloat(record.fine_amount).toLocaleString()}
                            </p>
                            <p className="text-xs text-gray-500">Fine Amount</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Assign Fine Dialog */}
        <Dialog
          open={assignFineDialog.open}
          onOpenChange={(open) => setAssignFineDialog((d) => ({ ...d, open }))}
        >
          <DialogContent className="max-w-xs">
            <DialogHeader>
              <DialogTitle>Assign Fine</DialogTitle>
              <DialogDescription>
                Enter the fine amount for this book record.
              </DialogDescription>
            </DialogHeader>
            <Input
              type="number"
              min="0"
              value={assignFineValue}
              onChange={(e) => setAssignFineValue(e.target.value)}
              className="mb-4"
              placeholder="Enter fine amount"
              disabled={assignFineLoading}
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() =>
                  setAssignFineDialog({
                    open: false,
                    recordId: null,
                    currentFine: 0,
                  })
                }
                disabled={assignFineLoading}
              >
                Cancel
              </Button>
              <Button
                onClick={async () => {
                  if (!assignFineDialog.recordId) return;
                  setAssignFineLoading(true);
                  try {
                    await updateLibraryFine(
                      assignFineDialog.recordId,
                      parseFloat(assignFineValue)
                    );
                    setAssignFineDialog({
                      open: false,
                      recordId: null,
                      currentFine: 0,
                    });
                    setAssignFineValue("");
                    // Refresh grouped records
                    const data = await getGroupedLibraryRecords();
                    setGroupedRecords(data);
                  } catch (e) {
                    // Optionally show error
                  } finally {
                    setAssignFineLoading(false);
                  }
                }}
                disabled={assignFineLoading || assignFineValue === ""}
              >
                Save
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
