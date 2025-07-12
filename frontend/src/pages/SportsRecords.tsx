import React, { useEffect, useState } from "react";
import { useAuth } from "../context/useAuth";
import { getStaffProfile, StaffProfile } from "../services/departmentService";
import {
  Loader2,
  AlertCircle,
  Search,
  User,
  ChevronDown,
  ChevronRight,
  LogOut,
  IndianRupee,
  Calendar,
  MoreHorizontal,
  Trophy,
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../components/ui/dialog";
import api from "../services/api";

interface Student {
  username: string;
  first_name: string;
  last_name: string;
}

interface SportsRecord {
  id: number;
  student: any;
  equipment_name: string;
  borrowing_date: string;
  fine_amount: number;
}

interface GroupedStudent {
  roll_numbers: string[];
  name: string;
  course: string;
  batch: string;
  phone_number: string;
  records: SportsRecord[];
  total_fine_amount: number;
  user: Student;
}

// Memoized table row component for better performance
const SportsRecordRow = React.memo(
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
              {group.records.length} equipment
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
                    <Trophy className="h-5 w-5 text-blue-600" />
                    Sports Equipment Records
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
                            <div className="font-semibold text-gray-900">
                              Equipment: {record.equipment_name}
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

SportsRecordRow.displayName = "SportsRecordRow";

export default function SportsRecords() {
  const { logout, accessToken } = useAuth();
  const [groupedRecords, setGroupedRecords] = useState<GroupedStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterLoading, setFilterLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [staffProfile, setStaffProfile] = useState<StaffProfile | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [showStudentDetails, setShowStudentDetails] = useState(false);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [assignFineDialog, setAssignFineDialog] = useState<{
    open: boolean;
    recordId: number | null;
    currentFine: number;
  }>({ open: false, recordId: null, currentFine: 0 });
  const [assignFineValue, setAssignFineValue] = useState<string>("");
  const [assignFineLoading, setAssignFineLoading] = useState(false);
  const [showAssignDueDialog, setShowAssignDueDialog] = useState(false);
  const [studentSearchTerm, setStudentSearchTerm] = useState("");
  const [studentSuggestions, setStudentSuggestions] = useState<any[]>([]);
  const [selectedStudentForAssign, setSelectedStudentForAssign] =
    useState<any>(null);
  const [assignDueForm, setAssignDueForm] = useState({
    equipment_name: "",
    borrowing_date: "",
    fine_amount: "",
  });
  const [assignDueLoading, setAssignDueLoading] = useState(false);

  // Filter and group records
  const filteredGroups = groupedRecords.filter((group) => {
    const search = searchTerm.trim().toLowerCase();
    const matchesSearch =
      !search ||
      (group.roll_numbers[0]?.toLowerCase() || "").includes(search) ||
      (group.name?.toLowerCase() || "").includes(search) ||
      group.records.some((r: any) =>
        (r.equipment_name?.toLowerCase() || "").includes(search)
      );
    return matchesSearch;
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

  const fetchData = async () => {
    setLoading(true);
    try {
      if (!accessToken) {
        console.log("No access token found, redirecting to login");
        return;
      }

      const storedDepartment = localStorage.getItem("department");
      if (
        !storedDepartment ||
        (storedDepartment.toLowerCase() !== "sports" &&
          storedDepartment.toLowerCase() !== "sports_incharge")
      ) {
        console.log("Invalid department for sports records:", storedDepartment);
        return;
      }

      const profile = await getStaffProfile();
      setStaffProfile(profile);

      const res = await api.get("/dues/sports-records/grouped_by_student/");
      setGroupedRecords(res.data);
      setError(null);
    } catch (e: any) {
      setError(e.message || "Failed to fetch grouped records");
    } finally {
      setLoading(false);
    }
  };

  // Fetch grouped records on mount/refresh
  useEffect(() => {
    fetchData();
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

  const handleAssignFine = async () => {
    if (!assignFineDialog.recordId) return;
    setAssignFineLoading(true);
    try {
      await api.patch(`/dues/sports-records/${assignFineDialog.recordId}/`, {
        fine_amount: assignFineValue,
      });
      setAssignFineDialog({
        open: false,
        recordId: null,
        currentFine: 0,
      });
      setAssignFineValue("");
      // Refresh data
      await fetchData();
    } catch (e) {
      // Optionally show error
    } finally {
      setAssignFineLoading(false);
    }
  };

  // Student search functionality
  const searchStudents = async (query: string) => {
    if (query.length < 3) {
      setStudentSuggestions([]);
      return;
    }
    try {
      const response = await api.get(`/students/search/?q=${query.trim()}`);
      setStudentSuggestions(response.data || []);
    } catch (error) {
      setStudentSuggestions([]);
    }
  };

  // Debounced student search
  React.useEffect(() => {
    const timer = setTimeout(() => {
      searchStudents(studentSearchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [studentSearchTerm]);

  const handleAssignDue = async () => {
    if (
      !selectedStudentForAssign ||
      !assignDueForm.equipment_name ||
      !assignDueForm.borrowing_date
    ) {
      return;
    }

    setAssignDueLoading(true);
    try {
      console.log("Sending data to backend:", {
        student: selectedStudentForAssign.id,
        equipment_name: assignDueForm.equipment_name,
        borrowing_date: assignDueForm.borrowing_date,
        fine_amount: assignDueForm.fine_amount || 0,
      });

      const response = await api.post("/dues/sports-records/", {
        student: selectedStudentForAssign.id,
        equipment_name: assignDueForm.equipment_name,
        borrowing_date: assignDueForm.borrowing_date,
        fine_amount: assignDueForm.fine_amount || 0,
      });

      console.log("Success response:", response.data);

      // Reset form and close dialog
      setAssignDueForm({
        equipment_name: "",
        borrowing_date: "",
        fine_amount: "",
      });
      setSelectedStudentForAssign(null);
      setStudentSearchTerm("");
      setStudentSuggestions([]);
      setShowAssignDueDialog(false);

      // Refresh data
      await fetchData();
    } catch (error: any) {
      console.error("Error assigning due:", error);
      console.error("Error response:", error.response?.data);
      console.error("Error status:", error.response?.status);
      // You could add a toast notification here to show the error to the user
    } finally {
      setAssignDueLoading(false);
    }
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
                Sports Equipment Records Dashboard
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 shadow-lg bg-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Records
              </CardTitle>
              <Trophy className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {statistics.totalRecords.toLocaleString()}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Sports equipment records
              </p>
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
            <CardTitle className="text-gray-900">Search & Assign</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row md:items-end gap-4">
              <div className="w-full md:w-64 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search by roll number, name, or equipment..."
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
              <Button
                onClick={() => setShowAssignDueDialog(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Trophy className="h-4 w-4 mr-2" />
                Assign Due
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Records Table */}
        <Card className="border-0 shadow-lg bg-white">
          <CardHeader>
            <CardTitle className="text-gray-900">
              Sports Equipment Records ({filteredGroups.length} students)
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
                <Trophy className="h-16 w-16 mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No sports equipment records found
                </h3>
                <p className="text-sm text-gray-500 text-center">
                  {searchTerm
                    ? "Try adjusting your search criteria."
                    : "No sports equipment records are available."}
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
                      <SportsRecordRow
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
                View detailed information about the selected student's sports
                equipment records.
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
                        {selectedStudent.records[0]?.student?.batch || "N/A"}
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

                {/* Sports Equipment Records */}
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">
                    Sports Equipment Records ({selectedStudent.records.length})
                  </h3>
                  <div className="space-y-3">
                    {selectedStudent.records.map((record: SportsRecord) => (
                      <div
                        key={record.id}
                        className="border rounded-lg p-4 bg-white"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                              <Trophy className="h-4 w-4 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-medium text-sm text-gray-900">
                                {record.equipment_name}
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
                              ₹
                              {parseFloat(
                                record.fine_amount.toString()
                              ).toLocaleString()}
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
                Enter the fine amount for this equipment record.
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
                onClick={handleAssignFine}
                disabled={assignFineLoading || assignFineValue === ""}
              >
                Save
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Assign Due Dialog */}
        <Dialog
          open={showAssignDueDialog}
          onOpenChange={setShowAssignDueDialog}
        >
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Assign Sports Due</DialogTitle>
              <DialogDescription>
                Search for a student and assign sports equipment due.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {/* Student Search */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Search Student
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search by name or roll number..."
                    value={studentSearchTerm}
                    onChange={(e) => setStudentSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* Student Suggestions */}
                {studentSuggestions.length > 0 && (
                  <div className="border rounded-lg max-h-40 overflow-y-auto">
                    {studentSuggestions.map((student) => (
                      <div
                        key={student.username}
                        className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                        onClick={() => {
                          setSelectedStudentForAssign(student);
                          setStudentSearchTerm(
                            `${student.name} (${student.username})`
                          );
                          setStudentSuggestions([]);
                        }}
                      >
                        <div className="font-medium text-gray-900">
                          {student.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          Roll: {student.username}
                        </div>
                        {student.course && (
                          <div className="text-sm text-gray-500">
                            Course: {student.course}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Selected Student Display */}
                {selectedStudentForAssign && (
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="font-medium text-blue-900">
                      Selected Student:
                    </div>
                    <div className="text-sm text-blue-700">
                      {selectedStudentForAssign.name}
                    </div>
                    <div className="text-sm text-blue-600">
                      Roll: {selectedStudentForAssign.username}
                    </div>
                  </div>
                )}
              </div>

              {/* Equipment Details */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Equipment Name
                </label>
                <Input
                  type="text"
                  placeholder="e.g., Football, Bat, Racket"
                  value={assignDueForm.equipment_name}
                  onChange={(e) =>
                    setAssignDueForm((prev) => ({
                      ...prev,
                      equipment_name: e.target.value,
                    }))
                  }
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Borrowing Date
                </label>
                <Input
                  type="date"
                  value={assignDueForm.borrowing_date}
                  onChange={(e) =>
                    setAssignDueForm((prev) => ({
                      ...prev,
                      borrowing_date: e.target.value,
                    }))
                  }
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Fine Amount (Optional)
                </label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={assignDueForm.fine_amount}
                  onChange={(e) =>
                    setAssignDueForm((prev) => ({
                      ...prev,
                      fine_amount: e.target.value,
                    }))
                  }
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setShowAssignDueDialog(false);
                  setSelectedStudentForAssign(null);
                  setStudentSearchTerm("");
                  setStudentSuggestions([]);
                  setAssignDueForm({
                    equipment_name: "",
                    borrowing_date: "",
                    fine_amount: "",
                  });
                }}
                disabled={assignDueLoading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleAssignDue}
                disabled={
                  assignDueLoading ||
                  !selectedStudentForAssign ||
                  !assignDueForm.equipment_name ||
                  !assignDueForm.borrowing_date
                }
              >
                {assignDueLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Assigning...
                  </>
                ) : (
                  "Assign Due"
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
