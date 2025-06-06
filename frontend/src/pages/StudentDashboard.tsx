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
  ChevronDown,
  ChevronRight,
  Upload,
  CreditCard,
  CheckCircle,
  Building2,
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import {
  uploadChallan,
  getChallans,
  Challan,
} from "../services/challanService";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "../components/ui/popover";

const StudentDashboard: React.FC = () => {
  const { logout, accessToken, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [academicDues, setAcademicDues] = useState<any[]>([]);
  const [hostelDues, setHostelDues] = useState<any[]>([]);
  const [showAcademic, setShowAcademic] = useState(false);
  const [showHostel, setShowHostel] = useState(false);
  const [showAcademicChallan, setShowAcademicChallan] = useState(false);
  const [showHostelChallan, setShowHostelChallan] = useState(false);
  const [amount, setAmount] = useState("");
  const [challanFile, setChallanFile] = useState<File | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [challans, setChallans] = useState<Challan[]>([]);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedChallan, setSelectedChallan] = useState<Challan | null>(null);

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

  useEffect(() => {
    const fetchChallans = async () => {
      try {
        const data = await getChallans("student");
        setChallans(data);
      } catch (error) {
        console.error("Error fetching challans:", error);
      }
    };
    fetchChallans();
  }, []);

  // Filter academic dues to only show one entry per year (remove duplicates)
  const uniqueAcademicDues = React.useMemo(() => {
    const seenYears = new Set();
    return academicDues.filter((due: any) => {
      if (seenYears.has(due.academic_year_label)) return false;
      seenYears.add(due.academic_year_label);
      return true;
    });
  }, [academicDues]);

  const handleChallanUpload = (department: "academic" | "hostel") => {
    // Here you would send amount and challanFile to your backend
    setUploadSuccess(true);
    setTimeout(() => setUploadSuccess(false), 2000);
    // Reset fields and close modal after a short delay
    setTimeout(() => {
      setAmount("");
      setChallanFile(null);
      if (department === "academic") setShowAcademicChallan(false);
      else setShowHostelChallan(false);
    }, 2000);
  };

  const handleUpload = async (formData: FormData) => {
    try {
      const rollNumber = (user as any)?.roll_number;
      if (!rollNumber) {
        throw new Error("Student roll number not found. Please log in again.");
      }
      console.log("Uploading challan with roll number:", rollNumber); // Debug log
      formData.append("student_roll_number", rollNumber);

      const newChallan = await uploadChallan(formData);
      setChallans([...challans, newChallan]);
      alert(
        "Challan uploaded! Your challan has been submitted for verification."
      );
      setShowAcademicChallan(false);
      setShowHostelChallan(false);
      setAmount("");
      setChallanFile(null);
      // Refresh challans
      const data = await getChallans("student");
      setChallans(data);
    } catch (error: any) {
      console.error("Error uploading challan:", error);
      const errorMessage =
        error.response?.data?.student_roll_number || error.message;
      alert(`Failed to upload challan: ${errorMessage}`);
    }
  };

  const handleViewChallan = (challan: Challan) => {
    setSelectedChallan(challan);
    setIsViewModalOpen(true);
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
      <header className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="bg-white p-2 rounded-lg shadow-md">
              <img
                src="/src/components/ui/assets/Telangana_University_logo.png"
                alt="Telangana University Logo"
                className="h-16 w-auto object-contain"
              />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#4f772d]">
                Telangana University
              </h1>
            </div>
          </div>
          {/* Profile Popover and Logout */}
          <div className="flex items-center gap-3">
            <Popover>
              <PopoverTrigger asChild>
                <button className="flex items-center gap-2 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full p-2 focus:outline-none focus:ring-2 focus:ring-blue-400">
                  <User className="h-7 w-7 text-white" />
                  <span className="text-base font-semibold text-white hidden sm:block">
                    {(user as any)?.user?.first_name}{" "}
                    {(user as any)?.user?.last_name}
                  </span>
                </button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-auto p-4">
                <div className="flex flex-col gap-4 min-w-[220px]">
                  {/* Name */}
                  <div className="flex items-center gap-3">
                    <div className="bg-gradient-to-br from-blue-500 to-purple-500 rounded-full p-2 flex items-center justify-center">
                      <User className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <div className="text-gray-500 text-xs font-medium">
                        Name
                      </div>
                      <div className="text-base font-semibold text-gray-900">
                        {(user as any)?.user?.first_name}{" "}
                        {(user as any)?.user?.last_name}
                      </div>
                    </div>
                  </div>
                  {/* Roll Number */}
                  <div className="flex items-center gap-3">
                    <div className="bg-green-500 rounded-full p-2 flex items-center justify-center">
                      <span className="text-white font-bold text-base">#</span>
                    </div>
                    <div>
                      <div className="text-gray-500 text-xs font-medium">
                        Roll Number
                      </div>
                      <div className="text-base font-semibold text-gray-900">
                        {(user as any)?.roll_number}
                      </div>
                    </div>
                  </div>
                  {/* Department */}
                  <div className="flex items-center gap-3">
                    <div className="bg-orange-400 rounded-full p-2 flex items-center justify-center">
                      <Building2 className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <div className="text-gray-500 text-xs font-medium">
                        Department
                      </div>
                      <div className="text-base font-semibold text-gray-900">
                        {(user as any)?.course}
                      </div>
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
            <button
              onClick={logout}
              className="flex items-center gap-1 bg-red-100 hover:bg-red-200 text-red-700 font-semibold px-3 py-2 rounded-full transition shadow-sm border border-red-200 focus:outline-none focus:ring-2 focus:ring-red-400"
              title="Logout"
            >
              <LogOut className="h-5 w-5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>
      <main className="container mx-auto px-6 py-8">
        {/* Academic Dues Section */}
        <Card className="border-none shadow-lg bg-white mb-8">
          <CardHeader
            onClick={() => setShowAcademic((prev) => !prev)}
            className="cursor-pointer select-none"
          >
            <div className="flex items-center gap-3">
              <div className="bg-blue-700 p-2 rounded-lg shadow-md">
                <School className="h-5 w-5 text-white" />
              </div>
              <CardTitle className="text-gray-800 flex items-center gap-2">
                Academic Dues
                {showAcademic ? (
                  <ChevronDown className="h-5 w-5 text-gray-500 transition-transform duration-200" />
                ) : (
                  <ChevronRight className="h-5 w-5 text-gray-500 transition-transform duration-200" />
                )}
              </CardTitle>
            </div>
          </CardHeader>
          {showAcademic && (
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50/50">
                    <TableHead>Year</TableHead>
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
                  {uniqueAcademicDues.map((due: any) => (
                    <TableRow key={due.id}>
                      <TableCell>{due.academic_year_label}</TableCell>
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
              <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-4 mt-4 w-full">
                <Button className="bg-blue-600 text-white flex items-center gap-2 w-full sm:w-auto px-4 py-2 sm:px-6 sm:py-2 text-base sm:text-sm">
                  <CreditCard className="h-4 w-4" />
                  Pay Now
                </Button>
                {/* <Button
                  variant="outline"
                  className="flex items-center gap-2 w-full sm:w-auto px-4 py-2 sm:px-6 sm:py-2 text-base sm:text-sm"
                  onClick={() => setShowAcademicChallan(true)}
                >
                  <Upload className="h-4 w-4" />
                  Upload Challan
                </Button> */}
              </div>
            </CardContent>
          )}
        </Card>
        <Dialog
          open={showAcademicChallan}
          onOpenChange={setShowAcademicChallan}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload Academic Challan</DialogTitle>
            </DialogHeader>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!amount || !challanFile) return;
                const formData = new FormData();
                formData.append("amount", String(amount));
                formData.append("department", "academic");
                formData.append("image", challanFile);
                formData.append(
                  "student_roll_number",
                  (user as any)?.roll_number
                );
                await handleUpload(formData);
                setShowAcademicChallan(false);
                setAmount("");
                setChallanFile(null);
                // Refresh challans
                const data = await getChallans("student");
                setChallans(data);
              }}
            >
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="academic-challan-amount"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Amount
                  </label>
                  <Input
                    id="academic-challan-amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Enter Amount"
                    type="number"
                  />
                </div>
                <div className="flex flex-col items-center gap-2">
                  <Upload className="h-8 w-8 text-blue-600 mb-1" />
                  <label
                    htmlFor="academic-challan-file"
                    className="block w-full cursor-pointer px-4 py-2 border-2 border-dashed border-blue-400 rounded-lg text-blue-700 bg-blue-50 hover:bg-blue-100 text-center transition"
                  >
                    {challanFile
                      ? `Selected: ${challanFile.name}`
                      : "Click to upload image"}
                    <Input
                      id="academic-challan-file"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) =>
                        setChallanFile(e.target.files?.[0] || null)
                      }
                    />
                  </label>
                </div>
                <Button
                  type="submit"
                  disabled={!amount || !challanFile || uploadSuccess}
                  className={`w-full transition-colors ${
                    uploadSuccess
                      ? "bg-blue-600 hover:bg-blue-700 text-white"
                      : ""
                  }`}
                >
                  {uploadSuccess ? (
                    <span className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5" /> Uploaded!
                    </span>
                  ) : (
                    "Submit"
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
        {/* Hostel Dues Section */}
        <Card className="border-none shadow-lg bg-white">
          <CardHeader
            onClick={() => setShowHostel((prev) => !prev)}
            className="cursor-pointer select-none"
          >
            <div className="flex items-center gap-3">
              <div className="bg-purple-700 p-2 rounded-lg shadow-md">
                <Home className="h-5 w-5 text-white" />
              </div>
              <CardTitle className="text-gray-800 flex items-center gap-2">
                Hostel Dues
                {showHostel ? (
                  <ChevronDown className="h-5 w-5 text-gray-500 transition-transform duration-200" />
                ) : (
                  <ChevronRight className="h-5 w-5 text-gray-500 transition-transform duration-200" />
                )}
              </CardTitle>
            </div>
          </CardHeader>
          {showHostel && (
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
              <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-4 mt-4 w-full">
                <Button className="bg-blue-600 text-white flex items-center gap-2 w-full sm:w-auto px-4 py-2 sm:px-6 sm:py-2 text-base sm:text-sm">
                  <CreditCard className="h-4 w-4" />
                  Pay Now
                </Button>
                {/* <Button
                  variant="outline"
                  className="flex items-center gap-2 w-full sm:w-auto px-4 py-2 sm:px-6 sm:py-2 text-base sm:text-sm"
                  onClick={() => setShowHostelChallan(true)}
                >
                  <Upload className="h-4 w-4" />
                  Upload Challan
                </Button> */}
              </div>
            </CardContent>
          )}
        </Card>
        <Dialog open={showHostelChallan} onOpenChange={setShowHostelChallan}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload Hostel Challan</DialogTitle>
            </DialogHeader>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!amount || !challanFile) return;
                const formData = new FormData();
                formData.append("amount", String(amount));
                formData.append("department", "hostel");
                formData.append("image", challanFile);
                formData.append(
                  "student_roll_number",
                  (user as any)?.roll_number
                );
                await handleUpload(formData);
                setShowHostelChallan(false);
                setAmount("");
                setChallanFile(null);
                // Refresh challans
                const data = await getChallans("student");
                setChallans(data);
              }}
            >
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="hostel-challan-amount"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Amount
                  </label>
                  <Input
                    id="hostel-challan-amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Enter Amount"
                    type="number"
                  />
                </div>
                <div className="flex flex-col items-center gap-2">
                  <Upload className="h-8 w-8 text-purple-600 mb-1" />
                  <label
                    htmlFor="hostel-challan-file"
                    className="block w-full cursor-pointer px-4 py-2 border-2 border-dashed border-purple-400 rounded-lg text-purple-700 bg-purple-50 hover:bg-purple-100 text-center transition"
                  >
                    {challanFile
                      ? `Selected: ${challanFile.name}`
                      : "Click to upload image"}
                    <Input
                      id="hostel-challan-file"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) =>
                        setChallanFile(e.target.files?.[0] || null)
                      }
                    />
                  </label>
                </div>
                <Button
                  type="submit"
                  disabled={!amount || !challanFile || uploadSuccess}
                  className={`w-full transition-colors ${
                    uploadSuccess
                      ? "bg-blue-600 hover:bg-blue-700 text-white"
                      : ""
                  }`}
                >
                  {uploadSuccess ? (
                    <span className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5" /> Uploaded!
                    </span>
                  ) : (
                    "Submit"
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-2">Your Challans</h2>
          <div className="space-y-2">
            {challans.length === 0 && (
              <div className="text-gray-500">No challans uploaded yet.</div>
            )}
            {challans.map((challan) => (
              <div
                key={challan.id}
                className="flex items-center gap-4 p-2 border rounded shadow-sm bg-gray-50"
              >
                <span className="font-mono text-sm">₹{challan.amount}</span>
                <span className="capitalize text-xs px-2 py-1 rounded bg-blue-100 text-blue-700">
                  {challan.department}
                </span>
                <span
                  className={`text-xs px-2 py-1 rounded ${
                    challan.status === "verified"
                      ? "bg-green-100 text-green-700"
                      : challan.status === "rejected"
                      ? "bg-red-100 text-red-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {challan.status.charAt(0).toUpperCase() +
                    challan.status.slice(1)}
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleViewChallan(challan)}
                >
                  View
                </Button>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>View Challan</DialogTitle>
          </DialogHeader>
          {selectedChallan && (
            <>
              <p>
                <b>Amount:</b> {selectedChallan.amount}
              </p>
              <p>
                <b>Department:</b> {selectedChallan.department}
              </p>
              <p>
                <b>Status:</b> {selectedChallan.status}
              </p>
              <p>
                <b>Remarks:</b> {selectedChallan.remarks || "-"}
              </p>
              <img
                src={selectedChallan.image}
                alt="Challan"
                className="max-w-full max-h-64 rounded border"
              />
              <Button onClick={() => setIsViewModalOpen(false)}>Close</Button>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StudentDashboard;
