import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
  Home,
  Search,
  IndianRupee,
  ChevronDown,
  ChevronRight,
  LogOut,
  Briefcase,
  User,
  Phone,
  Mail,
  Pencil,
  Save,
  X,
} from "lucide-react";

import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Input } from "../components/ui/input";
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
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
  id: number;
  student: {
    roll_number: string;
    full_name: string;
    phone_number: string;
    caste: string;
    course: string;
  };
  year_of_study: string;
  mess_bill: number;
  scholarship: number;
  deposit: number;
  remarks: string;
  total_amount: number;
  due_amount: number;
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

export default function HostelDues() {
  const { logout, accessToken } = useAuth();
  const navigate = useNavigate();
  const [hostelDues, setHostelDues] = useState<HostelDue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCourse, setSelectedCourse] = useState<string>("all");
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [staffProfile, setStaffProfile] = useState<StaffProfile | null>(null);
  const [selectedStudent, setSelectedStudent] =
    useState<HostelStudentGroup | null>(null);
  const [showStudentDetails, setShowStudentDetails] = useState(false);
  const [editingDue, setEditingDue] = useState<HostelDue | null>(null);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);

  // Function to group hostel dues by student
  const groupHostelDuesByStudent = (
    dues: HostelDue[]
  ): HostelStudentGroup[] => {
    if (!Array.isArray(dues)) {
      console.error("Invalid hostel dues data:", dues);
      return [];
    }

    const grouped = dues.reduce(
      (acc: Record<string, HostelStudentGroup>, due) => {
        if (!due.student.roll_number) {
          console.warn("Skipping due with missing roll number:", due);
          return acc;
        }
        const key = due.student.roll_number;
        if (!acc[key]) {
          acc[key] = {
            roll_numbers: [due.student.roll_number],
            name: due.student.full_name || "N/A",
            course: due.student.course || "N/A",
            caste: due.student.caste || "N/A",
            phone_number: due.student.phone_number || "N/A",
            dues: [],
            total_amount: 0,
            due_amount: 0,
          };
        }
        acc[key].dues.push(due);
        acc[key].total_amount += due.total_amount;
        acc[key].due_amount += due.due_amount;
        return acc;
      },
      {}
    );

    return Object.values(grouped);
  };

  // Filter and group dues
  const filteredGroups = groupHostelDuesByStudent(
    hostelDues.filter((due) => {
      const search = searchTerm.trim().toLowerCase();
      const matchesSearch =
        !search ||
        (due.student.roll_number?.toLowerCase() || "").includes(search) ||
        (due.student.full_name?.toLowerCase() || "").includes(search);
      const matchesCourse =
        selectedCourse === "all" || due.student.course === selectedCourse;
      return matchesSearch && matchesCourse;
    })
  );

  // Function to handle due update
  const handleUpdateDue = async (due: HostelDue) => {
    try {
      setUpdateLoading(true);
      setUpdateError(null);

      const updatedDue = await updateHostelDue(due.id, {
        mess_bill: due.mess_bill,
        scholarship: due.scholarship,
        deposit: due.deposit,
        remarks: due.remarks,
      });

      // Update the local state with the updated due
      setHostelDues((prevDues) =>
        prevDues.map((d) => (d.id === due.id ? updatedDue : d))
      );

      // Close the editing state
      setEditingDue(null);
    } catch (error) {
      setUpdateError(
        error instanceof Error ? error.message : "Failed to update due"
      );
    } finally {
      setUpdateLoading(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!accessToken) {
          console.log("No access token found, redirecting to login");
          navigate("/staff-login");
          return;
        }

        const storedDepartment = localStorage.getItem("department");
        if (
          !storedDepartment ||
          (storedDepartment.toLowerCase() !== "hostel" &&
            storedDepartment.toLowerCase() !== "hostel_superintendent")
        ) {
          console.log("Invalid department for hostel dues:", storedDepartment);
          navigate("/staff-login");
          return;
        }

        // Fetch staff profile
        const profile = await getStaffProfile();

        setStaffProfile(profile);

        // Fetch hostel dues
        console.log("Fetching hostel dues...");
        const dues = await getHostelDues();

        if (!Array.isArray(dues)) {
          console.error("Invalid hostel dues data received:", dues);
          setError("Invalid data received from server");
          return;
        }

        setHostelDues(dues);

        setError(null);
      } catch (error) {
        console.error("Error fetching data:", error);
        if (error instanceof Error) {
          if (error.message.includes("session has expired")) {
            navigate("/login");
          } else {
            setError(error.message);
          }
        } else {
          setError("Failed to fetch data");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [accessToken, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-4">
            <div className="bg-gradient-to-br from-blue-600 to-purple-600 p-3 rounded-xl shadow-md">
              <Home className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Hostel Dues Management
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                View and manage student hostel dues
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={logout}
            className="hover:bg-red-50 hover:text-red-600 hover:border-red-200"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
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

        {/* Filters */}
        <Card className="mb-6 border-none shadow-lg bg-white">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-600" />
                <Input
                  type="text"
                  placeholder="Search by roll number or name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white border-gray-200 focus:border-black focus:ring-black"
                />
              </div>
              <Select value={selectedCourse} onValueChange={setSelectedCourse}>
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
            </div>
          </CardContent>
        </Card>

        {/* Dues Table */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-gray-600" />
          </div>
        ) : (
          <Card className="border-none shadow-lg bg-white">
            <CardContent className="p-6">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-blue-50">
                      <TableHead className="w-8"></TableHead>
                      <TableHead>Student Details</TableHead>
                      <TableHead>Course</TableHead>
                      <TableHead>Dues Summary</TableHead>
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
                                onClick={() => {
                                  setSelectedStudent(group);
                                  setShowStudentDetails(true);
                                }}
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
                                Total Mess Bill: ₹
                                {group.total_amount.toFixed(2)}
                              </div>
                              <div className="flex items-center gap-2 text-red-600 mt-1">
                                <AlertCircle className="h-4 w-4" />
                                Total Due: ₹{group.due_amount.toFixed(2)}
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
                                                  <>
                                                    <Save className="h-4 w-4 mr-1" />
                                                    Save
                                                  </>
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
                                                <X className="h-4 w-4 mr-1" />
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
                                              <Pencil className="h-4 w-4 mr-1" />
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
            </CardContent>
          </Card>
        )}

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
                    <p className="font-medium">{selectedStudent.caste}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Phone Number</p>
                    <p className="font-medium">
                      {selectedStudent.phone_number}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Course</p>
                    <p className="font-medium">{selectedStudent.course}</p>
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
