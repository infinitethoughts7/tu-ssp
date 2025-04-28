import React, { useEffect, useState } from "react";
import { fetchDues } from "../services/api";
import { useAuth } from "../context/useAuth";
import {
  UserRound,
  Building2,
  BookOpen,
  Calendar,
  Search,
  Filter,
  Download,
  FileText,
  GraduationCap,
  ChevronDown,
  ChevronRight,
  Upload,
  X,
  Receipt,
} from "lucide-react";

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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Upload Payment Receipt
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">
            Department: <span className="font-medium">{department}</span>
          </p>
          <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center">
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
              <Upload size={24} className="text-gray-400" />
              <span className="text-sm text-gray-600">
                {file ? file.name : "Click to upload receipt"}
              </span>
              <span className="text-xs text-gray-500">
                Supported formats: JPG, PNG, PDF
              </span>
            </label>
          </div>
        </div>
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={!file || isUploading}
            className="px-4 py-2 text-sm font-medium text-white bg-gray-800 hover:bg-gray-900 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUploading ? "Uploading..." : "Upload Receipt"}
          </button>
        </div>
      </div>
    </div>
  );
};

const StudentDashboard: React.FC = () => {
  const [dues, setDues] = useState<Due[]>([]);
  const { logout, accessToken, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [departmentSummaries, setDepartmentSummaries] = useState<
    DepartmentSummary[]
  >([]);
  const [searchTerm, setSearchTerm] = useState("");
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
    <div className="min-h-screen bg-gray-50">
      {/* University Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="bg-gray-800 p-2 rounded-lg">
                <GraduationCap size={32} className="text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Telangana University
                </h1>
                <p className="text-sm text-gray-500">Excellence in Education</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Student Profile Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
            <div className="flex-shrink-0 bg-gray-50 p-4 rounded-xl text-gray-600">
              <UserRound size={48} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-grow">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {studentDetails.name}
                </h2>
                <p className="text-gray-600 font-medium">
                  {studentDetails.roll_number}
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-gray-600">
                  <BookOpen size={16} />
                  <span>
                    {studentDetails.course} - {studentDetails.branch}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar size={16} />
                  <span>Year {studentDetails.year}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <FileText size={16} />
                  <span>Category: {studentDetails.category}</span>
                </div>
              </div>

              <div className="flex items-center justify-end">
                <div className="bg-red-50 text-red-700 px-6 py-3 rounded-lg font-medium flex items-center gap-2 border border-red-100">
                  <span className="text-sm">Total Unpaid:</span>
                  <span className="text-lg">
                    ₹
                    {departmentSummaries
                      .reduce((sum, dept) => sum + dept.unpaidAmount, 0)
                      .toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Department Dues Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div className="flex items-center gap-3">
              <div className="bg-gray-50 p-2 rounded-lg">
                <Building2 size={20} className="text-gray-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">
                Department Dues
              </h2>
            </div>

            <div className="relative w-full md:w-64">
              <input
                type="text"
                placeholder="Search departments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent text-sm bg-gray-50"
              />
              <Search
                size={16}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              />
            </div>
          </div>

          {/* Department Cards */}
          <div className="space-y-4">
            {departmentSummaries
              .filter(
                (summary) =>
                  searchTerm === "" ||
                  summary.department
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase())
              )
              .map((summary) => (
                <div
                  key={summary.department}
                  className="border border-gray-100 rounded-lg overflow-hidden hover:border-gray-200 transition-colors"
                >
                  {/* Department Header */}
                  <div
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => toggleDepartment(summary.department)}
                  >
                    <div className="flex items-center gap-3 mb-3 sm:mb-0">
                      {summary.isExpanded ? (
                        <ChevronDown size={20} className="text-gray-500" />
                      ) : (
                        <ChevronRight size={20} className="text-gray-500" />
                      )}
                      <h3 className="text-lg font-medium text-gray-900">
                        {summary.department}
                      </h3>
                    </div>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 w-full sm:w-auto">
                      <div className="text-right w-full sm:w-auto">
                        <p className="text-sm text-gray-500">Total Amount</p>
                        <p className="text-lg font-semibold text-gray-900">
                          ₹{summary.totalAmount.toFixed(2)}
                        </p>
                      </div>
                      <div className="text-right w-full sm:w-auto">
                        <p className="text-sm text-gray-500">Unpaid</p>
                        <p className="text-lg font-semibold text-red-600">
                          ₹{summary.unpaidAmount.toFixed(2)}
                        </p>
                      </div>
                      {summary.unpaidAmount > 0 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedDepartment(summary.department);
                            setShowReceiptModal(true);
                          }}
                          className="mt-2 sm:mt-0 w-full sm:w-auto text-gray-700 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                        >
                          <Upload size={16} />
                          Upload Receipt
                        </button>
                      )}
                      {summary.receipt && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            // Open receipt in new tab or modal
                            window.open(summary.receipt, "_blank");
                          }}
                          className="mt-2 sm:mt-0 w-full sm:w-auto text-gray-700 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                        >
                          <Receipt size={16} />
                          View Receipt
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Department Details */}
                  {summary.isExpanded && (
                    <div className="border-t border-gray-100">
                      <div className="overflow-x-auto">
                        <table className="min-w-full">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Description
                              </th>
                              <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Amount
                              </th>
                              <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Due Date
                              </th>
                              <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {summary.dues.map((due) => (
                              <tr
                                key={due.id}
                                className="hover:bg-gray-50 transition-colors"
                              >
                                <td className="px-4 sm:px-6 py-4 text-sm text-gray-900">
                                  {due.description}
                                </td>
                                <td className="px-4 sm:px-6 py-4 text-sm text-gray-900">
                                  ₹{due.amount}
                                </td>
                                <td className="px-4 sm:px-6 py-4 text-sm text-gray-900">
                                  {new Date(due.due_date).toLocaleDateString()}
                                </td>
                                <td className="px-4 sm:px-6 py-4 text-sm">
                                  <span
                                    className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full ${
                                      due.is_paid
                                        ? "bg-green-100 text-green-800"
                                        : "bg-red-100 text-red-800"
                                    }`}
                                  >
                                    {due.is_paid ? "Paid" : "Unpaid"}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              ))}
          </div>
        </div>

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
        <div className="text-center text-gray-500 text-sm py-4">
          <p>© 2025 Telangana University. All rights reserved.</p>
          <p className="mt-1">Student Portal v2.0</p>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
