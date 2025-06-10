import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import {
  Search,
  Plus,
  Briefcase,
  LogOut,
  User,
  Phone,
  Mail,
  BookOpen,
  Trophy,
  Beaker,
} from "lucide-react";
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
import api from "../services/api";
import axios from "axios";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "../components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../components/ui/popover";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "../lib/utils";
import { debounce } from "lodash";

// TypeScript types
type StaffProfile = {
  name: string;
  email: string;
  phone_number: string;
  department: string;
};

type OtherDue = {
  id: number;
  student_name: string;
  student: string;
  category: string;
  amount: number;
  remark: string;
  created_by_name: string;
  created_at: string;
};

// Add new type for student suggestions
type StudentSuggestion = {
  roll_number: string;
  name: string;
  caste: string;
  course: string;
};

const CATEGORY_MAP: { [key: string]: string } = {
  librarian: "library",
  sports_incharge: "sports",
  lab_incharge: "lab",
};

const TITLE_MAP: { [key: string]: string } = {
  librarian: "Student Library Dues",
  sports_incharge: "Student Sports Dues",
  lab_incharge: "Student Lab Dues",
};

export default function OthersDues() {
  const { logout, accessToken } = useAuth();
  const [dues, setDues] = useState<OtherDue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddDueModal, setShowAddDueModal] = useState(false);
  const [newDue, setNewDue] = useState({
    student_roll_number: "",
    amount: "",
    remark: "",
  });
  const [staffProfile, setStaffProfile] = useState<StaffProfile | null>(null);
  const [category, setCategory] = useState("");
  const [pageTitle, setPageTitle] = useState("Other Dues Dashboard");
  const navigate = useNavigate();
  const [studentSuggestions, setStudentSuggestions] = useState<
    StudentSuggestion[]
  >([]);
  const [open, setOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] =
    useState<StudentSuggestion | null>(null);

  useEffect(() => {
    if (accessToken) {
      fetchStaffProfile();
    }
  }, [accessToken]);

  useEffect(() => {
    if (category) {
      fetchDues();
    }
  }, [category]);

  const fetchStaffProfile = async () => {
    try {
      const response = await api.get("/staff/profile/");
      const staffProfile = response.data;
      const department = staffProfile.department;
      const category = CATEGORY_MAP[department] || "library";
      const title = TITLE_MAP[department] || "Student Library Dues";

      setCategory(category);
      setPageTitle(title);
      setStaffProfile(staffProfile);
    } catch (error) {
      console.error("Error fetching staff profile:", error);
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        navigate("/staff-login");
      }
    }
  };

  const fetchDues = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/dues/other-dues/?category=${category}`);
      setDues(res.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching dues:", err);
      setError("Failed to fetch dues");
    } finally {
      setLoading(false);
    }
  };

  // Add debounced search function
  const debouncedSearch = useCallback(
    debounce(async (query: string) => {
      if (query.length < 3) {
        setStudentSuggestions([]);
        return;
      }

      console.log("Searching with query:", query); // Debug log

      try {
        // Use the roll number directly in the URL path
        const response = await api.get(`/students/${query.trim()}/`);

        console.log("Search response:", response.data); // Debug log

        if (response.data) {
          // Convert single student response to array format
          setStudentSuggestions([response.data]);
        } else {
          setStudentSuggestions([]);
        }
      } catch (error) {
        console.error("Error fetching student suggestions:", error);
        setStudentSuggestions([]);

        // Enhanced error logging
        if (axios.isAxiosError(error)) {
          console.log("Error details:", {
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data,
            config: {
              url: error.config?.url,
              method: error.config?.method,
            },
          });

          if (error.response?.status === 404) {
            console.log("Student not found. Please check the roll number.");
          } else if (error.response?.status === 400) {
            console.log("Invalid roll number format. Please try again.");
          }
        }
      }
    }, 500),
    []
  );

  // Update the input handler
  const handleStudentSearch = (value: string) => {
    console.log("Input value:", value); // Debug log
    setNewDue({ ...newDue, student_roll_number: value });
    setOpen(true);
    if (value.trim()) {
      debouncedSearch(value.trim());
    } else {
      setStudentSuggestions([]);
    }
  };

  // Update handleAddDue to use selected student
  const handleAddDue = async () => {
    if (!selectedStudent) return;

    try {
      await api.post("/dues/other-dues/", {
        student: selectedStudent.roll_number,
        category: category,
        amount: newDue.amount,
        remark: newDue.remark,
      });
      setShowAddDueModal(false);
      setNewDue({ student_roll_number: "", amount: "", remark: "" });
      setSelectedStudent(null);
      fetchDues();
    } catch (err) {
      console.error("Error adding due:", err);
      alert("Failed to add due");
    }
  };

  const getDepartmentIcon = () => {
    switch (category) {
      case "library":
        return <BookOpen className="h-6 w-6 text-blue-600" />;
      case "sports":
        return <Trophy className="h-6 w-6 text-yellow-600" />;
      case "lab":
        return <Beaker className="h-6 w-6 text-red-600" />;
      default:
        return <Briefcase className="h-6 w-6 text-gray-600" />;
    }
  };

  const filteredDues = dues.filter((due) => {
    const search = searchTerm.trim().toLowerCase();
    return (
      !search ||
      (due.student_name && due.student_name.toLowerCase().includes(search)) ||
      (due.student && due.student.toLowerCase().includes(search))
    );
  });

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
              <h1 className="text-3xl font-bold text-gray-900">{pageTitle}</h1>
              {staffProfile && (
                <div className="flex items-center space-x-2 text-sm text-gray-600 mt-1">
                  <Briefcase className="h-4 w-4 text-blue-500" />
                  <span>{staffProfile.department}</span>
                </div>
              )}
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
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-gray-600">
                  Loading staff profile...
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Search and Dues Card */}
        <Card className="border-none shadow-lg bg-white">
          <CardContent className="p-6">
            <div className="mb-6 pb-6 border-b border-gray-100">
              <div className="flex gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-600" />
                  <Input
                    type="text"
                    placeholder="Search by student name or roll number..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-white border-gray-200 focus:border-black focus:ring-black"
                  />
                </div>
                <Button
                  variant="outline"
                  className="bg-green-600 text-white hover:bg-green-700"
                  onClick={() => setShowAddDueModal(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Assign Due
                </Button>
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600"></div>
              </div>
            ) : (
              <div className="overflow-x-auto w-full">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-blue-50">
                      <TableHead>Student</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Remark</TableHead>
                      <TableHead>Assigned By</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDues.map((due) => (
                      <TableRow key={due.id}>
                        <TableCell>{due.student_name || due.student}</TableCell>
                        <TableCell>{due.category}</TableCell>
                        <TableCell>₹{due.amount}</TableCell>
                        <TableCell>{due.remark}</TableCell>
                        <TableCell>{due.created_by_name}</TableCell>
                        <TableCell>
                          {new Date(due.created_at).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Add Due Modal */}
        <Dialog open={showAddDueModal} onOpenChange={setShowAddDueModal}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Assign New Due</DialogTitle>
              <DialogDescription>
                Assign a due to a student for this department.
              </DialogDescription>
            </DialogHeader>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                await handleAddDue();
              }}
              className="space-y-4"
            >
              <div className="flex flex-col space-y-2">
                <label className="text-sm font-medium">Student</label>
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="Enter student roll number..."
                    value={newDue.student_roll_number}
                    onChange={(e) => handleStudentSearch(e.target.value)}
                    className="w-full"
                  />
                  {open && studentSuggestions.length > 0 && (
                    <div className="absolute z-50 w-full mt-1 bg-white rounded-md shadow-lg border border-gray-200 max-h-[300px] overflow-y-auto">
                      {studentSuggestions.map((student) => (
                        <div
                          key={student.roll_number}
                          className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                          onClick={() => {
                            console.log("Selected student:", student); // Debug log
                            setSelectedStudent(student);
                            setNewDue({
                              ...newDue,
                              student_roll_number: student.roll_number,
                            });
                            setOpen(false);
                          }}
                        >
                          <div className="font-medium">{student.name}</div>
                          <div className="text-sm text-gray-500">
                            Roll No: {student.roll_number} | Course:{" "}
                            {student.course} | Caste: {student.caste}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {open &&
                    newDue.student_roll_number.length > 0 &&
                    newDue.student_roll_number.length < 3 && (
                      <div className="absolute z-50 w-full mt-1 bg-white rounded-md shadow-lg border border-gray-200 p-2 text-sm text-gray-500">
                        Please enter at least 3 characters
                      </div>
                    )}
                  {open &&
                    newDue.student_roll_number.length >= 3 &&
                    studentSuggestions.length === 0 && (
                      <div className="absolute z-50 w-full mt-1 bg-white rounded-md shadow-lg border border-gray-200 p-2 text-sm text-gray-500">
                        No student found with this roll number
                      </div>
                    )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Amount</label>
                  <Input
                    type="number"
                    placeholder="Enter amount"
                    value={newDue.amount}
                    onChange={(e) =>
                      setNewDue({ ...newDue, amount: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Remark (optional)
                  </label>
                  <Input
                    placeholder="Enter remark"
                    value={newDue.remark}
                    onChange={(e) =>
                      setNewDue({ ...newDue, remark: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => {
                    setShowAddDueModal(false);
                    setSelectedStudent(null);
                    setNewDue({
                      student_roll_number: "",
                      amount: "",
                      remark: "",
                    });
                    setOpen(false);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  disabled={!selectedStudent}
                >
                  Assign
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
