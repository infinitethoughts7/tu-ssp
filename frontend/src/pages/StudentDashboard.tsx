import React, { useEffect, useState } from "react";
import { getAcademicDues, getHostelDues } from "../services/departmentService";
import { useAuth } from "../context/useAuth";
import {
  School,
  Home,
  IndianRupee,
  AlertCircle,
  LogOut,
  User,
} from "lucide-react";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";

const StudentDashboard: React.FC = () => {
  const { logout, accessToken, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [academicDues, setAcademicDues] = useState<any[]>([]);
  const [hostelDues, setHostelDues] = useState<any[]>([]);

  useEffect(() => {
    const getDues = async () => {
      if (!accessToken) {
        setError("No authentication token found. Please login again.");
        setLoading(false);
        return;
      }
      try {
        const academicData = await getAcademicDues();
        setAcademicDues(academicData);
        const hostelData = await getHostelDues();
        setHostelDues(hostelData);
        setError(null);
      } catch {
        setError("Failed to fetch dues. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    getDues();
  }, [accessToken]);

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
      <header className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
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
          <Button
            variant="outline"
            onClick={logout}
            className="hover:bg-red-50 hover:text-red-600 hover:border-red-200"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>
      <main className="container mx-auto px-6 py-8">
        {/* Student Profile Section */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8 p-6 rounded-2xl shadow-xl bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
          <span className="text-3xl md:text-4xl font-extrabold text-white tracking-tight drop-shadow-lg w-full md:w-auto text-left">
            {(user as any)?.user?.first_name?.toUpperCase()}{" "}
            {(user as any)?.user?.last_name?.toUpperCase()}
          </span>
          <div className="flex flex-col items-end w-full md:w-auto">
            <span className="text-lg md:text-xl font-medium text-white/90 drop-shadow">
              Roll Number:{" "}
              <span className="font-semibold">
                {(user as any)?.roll_number}
              </span>
            </span>
            <span className="text-lg md:text-xl font-medium text-white/90 mt-1 drop-shadow">
              Course:{" "}
              <span className="font-semibold">{(user as any)?.course}</span>
            </span>
          </div>
        </div>
        {/* Academic Dues Section */}
        <Card className="border-none shadow-lg bg-white mb-8">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="bg-blue-700 p-2 rounded-lg shadow-md">
                <School className="h-5 w-5 text-white" />
              </div>
              <CardTitle className="text-gray-800">Academic Dues</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50/50">
                  <TableHead>Year</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Tuition Fee</TableHead>
                  <TableHead>Special Fee</TableHead>
                  <TableHead>Exam Fee</TableHead>
                  <TableHead>Paid by Govt</TableHead>
                  <TableHead>Paid by Student</TableHead>
                  <TableHead>Due Amount</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {academicDues.map((due: any) => (
                  <TableRow key={due.id}>
                    <TableCell>{due.academic_year_label}</TableCell>
                    <TableCell>{due.fee_structure?.course_name}</TableCell>
                    <TableCell>₹{due.fee_structure?.tuition_fee}</TableCell>
                    <TableCell>₹{due.fee_structure?.special_fee}</TableCell>
                    <TableCell>₹{due.fee_structure?.exam_fee}</TableCell>
                    <TableCell>₹{due.paid_by_govt}</TableCell>
                    <TableCell>₹{due.paid_by_student}</TableCell>
                    <TableCell>₹{due.due_amount}</TableCell>
                    <TableCell>
                      {due.payment_status === "Unpaid" ? (
                        <span className="text-red-600 font-semibold">
                          Unpaid
                        </span>
                      ) : (
                        <span className="text-green-600 font-semibold">
                          Paid
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        {/* Hostel Dues Section */}
        <Card className="border-none shadow-lg bg-white">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="bg-purple-700 p-2 rounded-lg shadow-md">
                <Home className="h-5 w-5 text-white" />
              </div>
              <CardTitle className="text-gray-800">Hostel Dues</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50/50">
                  <TableHead>Year</TableHead>
                  <TableHead>Mess Bill</TableHead>
                  <TableHead>Scholarship</TableHead>
                  <TableHead>Deposit</TableHead>
                  <TableHead>Remarks</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {hostelDues.map((due: any) => (
                  <TableRow key={due.id}>
                    <TableCell>{due.year_of_study}</TableCell>
                    <TableCell>₹{due.mess_bill}</TableCell>
                    <TableCell>₹{due.scholarship}</TableCell>
                    <TableCell>₹{due.deposit}</TableCell>
                    <TableCell>{due.remarks}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default StudentDashboard;
