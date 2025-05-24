import React, { useEffect, useState } from "react";
import { fetchDues } from "../services/api";
import { useAuth } from "../context/useAuth";
import {
  
  Building2,
 
  ChevronDown,
  ChevronRight,
  Upload,

  Receipt,
  IndianRupee,
  CreditCard,
  AlertCircle,
  CheckCircle2,
  Clock,
  School,
  Shield,
  LogOut,
} from "lucide-react";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";

import { Badge } from "../components/ui/badge";
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
} from "../components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../components/ui/popover";

// Types
type Department = {
  id: number;
  department: string;
  designation: string;
};

type Due = {
  id: number;
  department_details: Department;
  amount: string;
  due_date: string;
  description: string;
  is_paid: boolean;
};

type StudentDetails = {
  name: string;
  roll_number: string;
  course: string;
  year: number;
  category: string;
  branch: string;
  image?: string;
};

type DepartmentSummary = {
  department: string;
  totalAmount: number;
  unpaidAmount: number;
  dues: Due[];
  isExpanded: boolean;
  receipt?: string; // URL to the uploaded receipt
};

type ReceiptModalProps = {
  isOpen: boolean;
  onClose: () => void;
  department: string;
  onUpload: (file: File) => void;
};

// Helper function to capitalize first letter
const capitalizeFirstLetter = (string: string) => {
  return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
};

const ReceiptModal: React.FC<ReceiptModalProps> = ({
  isOpen,
  onClose,
  department,
  onUpload,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setIsUploading(true);
    try {
      await onUpload(file);
      setFile(null);
      onClose();
    } catch (error) {
      console.error("Error uploading receipt:", error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload Payment Receipt</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground mb-2">
              Department: <span className="font-medium">{department}</span>
            </p>
            <div className="border-2 border-dashed rounded-lg p-6 text-center">
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={handleFileChange}
                className="hidden"
                id="receipt-upload"
              />
              <label
                htmlFor="receipt-upload"
                className="cursor-pointer flex flex-col items-center gap-2"
              >
                <Upload className="h-8 w-8 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {file ? file.name : "Click to upload receipt"}
                </span>
                <span className="text-xs text-muted-foreground">
                  Supported formats: JPG, PNG, PDF
                </span>
              </label>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleUpload} disabled={!file || isUploading}>
              {isUploading ? "Uploading..." : "Upload Receipt"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
};

const StudentDashboard: React.FC = () => {
  const [dues, setDues] = useState<Due[]>([]);
  const { logout, accessToken, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [departmentSummaries, setDepartmentSummaries] = useState<
    DepartmentSummary[]
  >([]);
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(
    null
  );
  const [showReceiptModal, setShowReceiptModal] = useState(false);

  // Mock student data (in a real app, this would come from API)
  const studentDetails: StudentDetails = {
    name: user?.name || "Rocky Ganji",
    roll_number: user?.roll_number || "TU21CS105",
    course: "B.Tech",
    year: 3,
    category: "SC",
    branch: "Computer Science",
  };

  useEffect(() => {
    const getDues = async () => {
      if (!accessToken) {
        setError("No authentication token found. Please login again.");
        setLoading(false);
        return;
      }
      try {
        const data = await fetchDues(accessToken);
        setDues(data);
        setError(null);
      } catch {
        setError("Failed to fetch dues. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    getDues();
  }, [accessToken]);

  useEffect(() => {
    // Group dues by department and calculate summaries
    const groupedDues = dues.reduce((acc, due) => {
      const dept = capitalizeFirstLetter(due.department_details.department);
      if (!acc[dept]) {
        acc[dept] = {
          department: dept,
          totalAmount: 0,
          unpaidAmount: 0,
          dues: [],
          isExpanded: false,
          receipt: undefined,
        };
      }
      const amount = parseFloat(due.amount);
      acc[dept].totalAmount += amount;
      if (!due.is_paid) {
        acc[dept].unpaidAmount += amount;
      }
      acc[dept].dues.push(due);
      return acc;
    }, {} as Record<string, DepartmentSummary>);

    setDepartmentSummaries(Object.values(groupedDues));
  }, [dues]);

  const toggleDepartment = (department: string) => {
    setDepartmentSummaries((prev) =>
      prev.map((summary) =>
        summary.department === department
          ? { ...summary, isExpanded: !summary.isExpanded }
          : summary
      )
    );
  };

  const handleReceiptUpload = async (file: File) => {
    if (!selectedDepartment) return;
    // Here you would typically upload the file to your backend
    // and update the payment status for all dues in that department
    console.log("Uploading receipt for department:", selectedDepartment);
    console.log("File:", file);
    // Add your API call here to upload the receipt and update all dues in the department
  };

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
      {/* University Header */}
      <header className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="bg-blue-700 p-3 rounded-xl shadow-md">
                <School className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-blue-800">
                  Telangana University
                </h1>
                <p className="text-sm text-gray-500">Excellence in Education</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Popover>
                <PopoverTrigger asChild>
                  <button className="focus:outline-none">
                    {studentDetails.image ? (
                      <img
                        src={studentDetails.image}
                        alt="Student Avatar"
                        className="w-10 h-10 rounded-full object-cover border-2 border-blue-700 shadow"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-blue-700 flex items-center justify-center text-white font-bold text-lg border-2 border-blue-700 shadow">
                        {getInitials(studentDetails.name)}
                      </div>
                    )}
                  </button>
                </PopoverTrigger>
                <PopoverContent align="end" className="w-64 p-4">
                  <div className="flex flex-col items-center gap-2">
                    {studentDetails.image ? (
                      <img
                        src={studentDetails.image}
                        alt="Student Avatar"
                        className="w-16 h-16 rounded-full object-cover border-2 border-blue-700 shadow mb-2"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-blue-700 flex items-center justify-center text-white font-bold text-2xl border-2 border-blue-700 shadow mb-2">
                        {getInitials(studentDetails.name)}
                      </div>
                    )}
                    <div className="text-center">
                      <div className="font-semibold text-lg text-gray-800">
                        {studentDetails.name}
                      </div>
                      <div className="text-blue-700 font-medium text-sm">
                        {studentDetails.roll_number}
                      </div>
                    </div>
                    <div className="w-full border-t my-2" />
                    <div className="text-sm text-gray-600 w-full">
                      <div className="flex justify-between py-1">
                        <span className="font-medium">Course:</span>{" "}
                        <span>{studentDetails.course}</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="font-medium">Branch:</span>{" "}
                        <span>{studentDetails.branch}</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="font-medium">Year:</span>{" "}
                        <span>{studentDetails.year}</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="font-medium">Category:</span>{" "}
                        <span>{studentDetails.category}</span>
                      </div>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
              <Button
                variant="outline"
                onClick={logout}
                className="hover:bg-red-50 hover:text-red-600 hover:border-red-200"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {/* Department Dues Section */}
        <Card className="border-none shadow-lg bg-white">
          <CardHeader>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 w-full">
              <div className="flex items-center gap-3">
                <div className="bg-blue-700 p-2 rounded-lg shadow-md">
                  <Building2 className="h-5 w-5 text-white" />
                </div>
                <CardTitle className="text-gray-800">Department Dues</CardTitle>
              </div>
              <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                <span className="hidden md:inline-block text-sm text-gray-600 mr-2">
                  Total Unpaid:
                </span>
                <span className="inline-flex items-center gap-1 bg-orange-100 text-red-700 font-semibold px-4 py-1 rounded-full text-base shadow-sm border border-orange-200">
                  <AlertCircle className="h-4 w-4 text-red-500" />₹
                  {departmentSummaries
                    .reduce((sum, dept) => sum + dept.unpaidAmount, 0)
                    .toFixed(2)}
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {departmentSummaries.map((summary) => (
                <Card
                  key={summary.department}
                  className="border-none shadow-md hover:shadow-lg transition-shadow bg-white"
                >
                  <CardContent className="p-0">
                    <div
                      className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-white cursor-pointer hover:bg-gray-50 transition-colors border-b border-gray-100"
                      onClick={() => toggleDepartment(summary.department)}
                    >
                      <div className="flex items-center gap-3 mb-3 sm:mb-0">
                        {summary.isExpanded ? (
                          <ChevronDown className="h-5 w-5 text-purple-600" />
                        ) : (
                          <ChevronRight className="h-5 w-5 text-purple-600" />
                        )}
                        <h3 className="text-lg font-medium text-gray-800">
                          {summary.department}
                        </h3>
                      </div>
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 w-full sm:w-auto">
                        <div className="text-right w-full sm:w-auto">
                          <p className="text-sm text-gray-600 flex items-center gap-2 justify-end">
                            <CreditCard className="h-4 w-4 text-blue-500" />
                            Total Amount
                          </p>
                          <p className="text-lg font-semibold text-gray-800">
                            ₹{summary.totalAmount.toFixed(2)}
                          </p>
                        </div>
                        <div className="text-right w-full sm:w-auto">
                          <p className="text-sm text-gray-600 flex items-center gap-2 justify-end">
                            <AlertCircle className="h-4 w-4 text-red-500" />
                            Unpaid
                          </p>
                          <p className="text-lg font-semibold text-red-600">
                            ₹{summary.unpaidAmount.toFixed(2)}
                          </p>
                        </div>
                        {summary.unpaidAmount > 0 && (
                          <Button
                            variant="outline"
                            onClick={(
                              e: React.MouseEvent<HTMLButtonElement>
                            ) => {
                              e.stopPropagation();
                              setSelectedDepartment(summary.department);
                              setShowReceiptModal(true);
                            }}
                            className="mt-2 sm:mt-0 w-full sm:w-auto border-purple-200 text-purple-600 hover:bg-purple-50 hover:border-purple-300"
                          >
                            <Upload className="h-4 w-4 mr-2" />
                            Upload Receipt
                          </Button>
                        )}
                        {summary.receipt && (
                          <Button
                            variant="outline"
                            onClick={(
                              e: React.MouseEvent<HTMLButtonElement>
                            ) => {
                              e.stopPropagation();
                              window.open(summary.receipt, "_blank");
                            }}
                            className="mt-2 sm:mt-0 w-full sm:w-auto border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300"
                          >
                            <Receipt className="h-4 w-4 mr-2" />
                            View Receipt
                          </Button>
                        )}
                      </div>
                    </div>
                    {summary.isExpanded && (
                      <div className="border-t border-gray-100">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-gray-50/50">
                              <TableHead>Description</TableHead>
                              <TableHead>Amount</TableHead>
                              <TableHead>Due Date</TableHead>
                              <TableHead>Status</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {summary.dues.map((due) => (
                              <TableRow
                                key={due.id}
                                className="hover:bg-gray-50/50"
                              >
                                <TableCell className="font-medium">
                                  {due.description}
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <IndianRupee className="h-4 w-4 text-blue-500" />
                                    {due.amount}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4 text-purple-500" />
                                    {new Date(
                                      due.due_date
                                    ).toLocaleDateString()}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Badge
                                    variant={
                                      due.is_paid ? "default" : "destructive"
                                    }
                                    className={
                                      due.is_paid
                                        ? "bg-green-100 text-green-700 hover:bg-green-100"
                                        : ""
                                    }
                                  >
                                    {due.is_paid ? (
                                      <CheckCircle2 className="h-3 w-3 mr-1" />
                                    ) : (
                                      <AlertCircle className="h-3 w-3 mr-1" />
                                    )}
                                    {due.is_paid ? "Paid" : "Unpaid"}
                                  </Badge>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Receipt Upload Modal */}
        <ReceiptModal
          isOpen={showReceiptModal}
          onClose={() => {
            setShowReceiptModal(false);
            setSelectedDepartment(null);
          }}
          department={
            selectedDepartment ? capitalizeFirstLetter(selectedDepartment) : ""
          }
          onUpload={handleReceiptUpload}
        />

        {/* Footer */}
        <footer className="text-center text-gray-500 text-sm py-6">
          <p>© 2025 Telangana University. All rights reserved.</p>
          <p className="mt-1">Student Portal v2.0</p>
        </footer>
      </main>
    </div>
  );
};

export default StudentDashboard;
