import React, { useEffect, useState } from "react";
import { useAuth } from "../context/useAuth";
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
import { Search, Plus, Briefcase, LogOut } from "lucide-react";
import api from "../services/api";
import axios from "axios";
import { useNavigate } from "react-router-dom";

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
      console.log("Staff Profile:", staffProfile);

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

  const handleAddDue = async () => {
    try {
      await api.post("/dues/other-dues/", {
        student: newDue.student_roll_number,
        category: category,
        amount: newDue.amount,
        remark: newDue.remark,
      });
      setShowAddDueModal(false);
      setNewDue({ student_roll_number: "", amount: "", remark: "" });
      fetchDues();
    } catch (err) {
      console.error("Error adding due:", err);
      alert("Failed to add due");
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
      <div className="max-w-5xl mx-auto p-6">
        {/* Staff Profile Card */}
        {staffProfile && (
          <Card className="mb-6 border-none shadow-lg bg-gradient-to-br from-white to-blue-50">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="flex items-center space-x-3">
                  <div className="bg-gradient-to-br from-blue-500 to-purple-500 p-3 rounded-full shadow-md">
                    <Briefcase className="h-6 w-6 text-white" />
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
                    <span className="h-6 w-6 text-white">@</span>
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
                    <span className="h-6 w-6 text-white">📞</span>
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
        )}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">{pageTitle}</h1>
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              onClick={logout}
              className="hover:bg-red-50 hover:text-red-600 hover:border-red-200"
            >
              <LogOut className="h-4 w-4 mr-2" /> Logout
            </Button>
            <Button
              variant="outline"
              className="bg-green-600 text-white hover:bg-green-700 ml-2"
              onClick={() => setShowAddDueModal(true)}
            >
              <Plus className="h-4 w-4 mr-2" /> Assign Due
            </Button>
          </div>
        </div>
        {error && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="p-4 flex items-center text-red-700">
              {error}
            </CardContent>
          </Card>
        )}
        <Card className="border-none shadow-lg bg-white">
          <CardContent className="p-6">
            <div className="mb-6 pb-6 border-b border-gray-100 flex gap-4">
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
            </div>
            {loading ? (
              <div className="flex justify-center items-center h-64">
                Loading...
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
        <Dialog open={showAddDueModal} onOpenChange={setShowAddDueModal}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Assign New Due</DialogTitle>
              <DialogDescription>
                Assign a due to a student for this department.
              </DialogDescription>
            </DialogHeader>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                try {
                  await api.post("/dues/other-dues/", {
                    student: newDue.student_roll_number,
                    amount: newDue.amount,
                    remark: newDue.remark,
                  });
                  setShowAddDueModal(false);
                  setNewDue({
                    student_roll_number: "",
                    amount: "",
                    remark: "",
                  });
                  fetchDues();
                } catch (err) {
                  console.error("Error adding due:", err);
                  alert("Failed to add due");
                }
              }}
              className="space-y-4"
            >
              <Input
                placeholder="Student Roll Number"
                value={newDue.student_roll_number}
                onChange={(e) =>
                  setNewDue({ ...newDue, student_roll_number: e.target.value })
                }
                required
              />
              <Input
                placeholder="Amount"
                type="number"
                value={newDue.amount}
                onChange={(e) =>
                  setNewDue({ ...newDue, amount: e.target.value })
                }
                required
              />
              <Input
                placeholder="Remark (optional)"
                value={newDue.remark}
                onChange={(e) =>
                  setNewDue({ ...newDue, remark: e.target.value })
                }
              />
              <div className="flex justify-end gap-2 mt-4">
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => setShowAddDueModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white"
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
