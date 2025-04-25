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

const StudentDashboard: React.FC = () => {
  const [dues, setDues] = useState<Due[]>([]);
  const { logout, accessToken, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "paid" | "unpaid">("all");
  const [deptFilter, setDeptFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

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

  // Get unique departments for filter
  const departments = [
    "all",
    ...new Set(dues.map((due) => due.department_details.department)),
  ];

  // Filter dues based on department, payment status, and search term
  const filteredDues = dues.filter((due) => {
    const matchesFilter =
      filter === "all" || (filter === "paid" ? due.is_paid : !due.is_paid);

    const matchesDept =
      deptFilter === "all" || due.department_details.department === deptFilter;

    const matchesSearch =
      searchTerm === "" ||
      due.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      due.department_details.department
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    return matchesFilter && matchesDept && matchesSearch;
  });

  const totalUnpaidAmount = dues
    .filter((due) => !due.is_paid)
    .reduce((sum, due) => sum + parseFloat(due.amount), 0);

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
      <div className="bg-gray-800 text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <GraduationCap size={36} className="text-white" />
            <div>
              <h1 className="text-2xl font-bold">Telangana University</h1>
              <p className="text-gray-300 text-sm">Excellence in Education</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="bg-white text-gray-800 px-4 py-2 rounded-md hover:bg-gray-100 font-medium transition"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="container mx-auto p-6">
        {/* Student Profile Card */}
        <div className="bg-white rounded-lg shadow p-6 mb-8 border border-gray-200">
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
            <div className="flex-shrink-0 bg-gray-100 p-4 rounded-full text-gray-800">
              <UserRound size={48} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-grow">
              <div>
                <h2 className="text-xl font-bold text-gray-800">
                  {studentDetails.name}
                </h2>
                <p className="text-gray-600 font-medium">
                  {studentDetails.roll_number}
                </p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <BookOpen size={16} className="text-gray-600" />
                  <span className="text-gray-700">
                    {studentDetails.course} - {studentDetails.branch}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-gray-600" />
                  <span className="text-gray-700">
                    Year {studentDetails.year}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <FileText size={16} className="text-gray-600" />
                  <span className="text-gray-700">
                    Category: {studentDetails.category}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-end">
                <div className="bg-red-50 text-red-700 px-6 py-3 rounded-md font-medium flex items-center gap-2 border border-red-200">
                  <span className="text-sm">Total Unpaid:</span>
                  <span className="text-lg">
                    ₹{totalUnpaidAmount.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters & Table */}
        <div className="bg-white rounded-lg shadow p-6 mb-8 border border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              <Building2 size={20} />
              Dues Management
            </h2>

            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 text-sm"
                />
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                />
              </div>

              <div className="relative group">
                <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition">
                  <Filter size={16} />
                  <span>Filters</span>
                </button>
                <div className="absolute right-0 z-10 mt-2 bg-white shadow-lg rounded-md p-4 border border-gray-200 hidden group-hover:block w-48">
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <div className="space-y-1">
                      <button
                        onClick={() => setFilter("all")}
                        className={`w-full text-left px-3 py-1 rounded-md text-sm ${
                          filter === "all"
                            ? "bg-gray-200 text-gray-800"
                            : "hover:bg-gray-100"
                        }`}
                      >
                        All
                      </button>
                      <button
                        onClick={() => setFilter("paid")}
                        className={`w-full text-left px-3 py-1 rounded-md text-sm ${
                          filter === "paid"
                            ? "bg-green-100 text-green-700"
                            : "hover:bg-gray-100"
                        }`}
                      >
                        Paid
                      </button>
                      <button
                        onClick={() => setFilter("unpaid")}
                        className={`w-full text-left px-3 py-1 rounded-md text-sm ${
                          filter === "unpaid"
                            ? "bg-red-100 text-red-700"
                            : "hover:bg-gray-100"
                        }`}
                      >
                        Unpaid
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Department
                    </label>
                    <div className="max-h-40 overflow-y-auto space-y-1">
                      {departments.map((dept) => (
                        <button
                          key={dept}
                          onClick={() => setDeptFilter(dept)}
                          className={`w-full text-left px-3 py-1 rounded-md text-sm ${
                            deptFilter === dept
                              ? "bg-gray-200 text-gray-800"
                              : "hover:bg-gray-100"
                          }`}
                        >
                          {dept === "all"
                            ? "All Departments"
                            : dept.charAt(0).toUpperCase() + dept.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <label className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700 transition cursor-pointer">
                <Download size={16} />
                <span>Import</span>
                <input
                  type="file"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      // Handle file import logic here
                      alert(
                        `File "${e.target.files[0].name}" selected for import`
                      );
                    }
                  }}
                />
              </label>
            </div>
          </div>

          {/* Table View */}
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-800 border-b border-gray-300">
                    Description
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-800 border-b border-gray-300">
                    Department
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-800 border-b border-gray-300">
                    Amount
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-800 border-b border-gray-300">
                    Due Date
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-800 border-b border-gray-300">
                    Dept Head
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-800 border-b border-gray-300">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-800 border-b border-gray-300">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredDues.length > 0 ? (
                  filteredDues.map((due) => (
                    <tr key={due.id} className="hover:bg-gray-50 transition">
                      <td className="px-4 py-3 text-sm text-gray-800">
                        {due.description}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-800">
                        {due.department_details.department
                          .charAt(0)
                          .toUpperCase() +
                          due.department_details.department.slice(1)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-800 font-medium">
                        ₹{due.amount}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-800">
                        {new Date(due.due_date).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-800">
                        {due.department_details.designation}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            due.is_paid
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {due.is_paid ? "Paid" : "Unpaid"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {!due.is_paid && (
                          <button className="text-gray-800 hover:text-black bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded text-xs font-medium">
                            Pay Now
                          </button>
                        )}
                        {due.is_paid && (
                          <button className="text-gray-800 hover:text-black bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded text-xs font-medium">
                            View Receipt
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-4 py-8 text-center text-gray-500"
                    >
                      No dues found matching your filters
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow border-l-4 border-gray-800">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500 mb-1">Total Dues</p>
                <p className="text-2xl font-bold text-gray-800">
                  {dues.length}
                </p>
              </div>
              <div className="p-3 bg-gray-100 rounded-lg text-gray-800">
                <FileText size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow border-l-4 border-green-600">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500 mb-1">Paid Dues</p>
                <p className="text-2xl font-bold text-gray-800">
                  {dues.filter((due) => due.is_paid).length}
                </p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg text-green-600">
                <FileText size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow border-l-4 border-red-600">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500 mb-1">Pending Dues</p>
                <p className="text-2xl font-bold text-gray-800">
                  {dues.filter((due) => !due.is_paid).length}
                </p>
              </div>
              <div className="p-3 bg-red-50 rounded-lg text-red-600">
                <FileText size={24} />
              </div>
            </div>
          </div>
        </div>

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
