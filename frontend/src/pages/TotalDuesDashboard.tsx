import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import {
  IndianRupee,
  Users,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
} from "lucide-react";

// Type definitions
interface StudentDataItem {
  year: number;
  course: string;
  department: string;
  studentsCount: number;
  scStStudents: number;
  generalStudents: number;
  totalAmount: number;
  collectedAmount: number;
  duesAmount: number;
  collectionPercentage: number;
}

interface DepartmentData {
  department: string;
  totalAmount: number;
  collectedAmount: number;
  duesAmount: number;
  studentsCount: number;
  collectionRate: number;
}

interface YearlyTrendData {
  year: number;
  totalAmount: number;
  collectedAmount: number;
  duesAmount: number;
  collectionRate: number;
}

interface FeeStructure {
  tuition: number;
  hostel: number;
  sports: number;
  labs: number;
  library: number;
  accounts: number;
  [key: string]: number; // Index signature for dynamic access
}

const courses = [
  "M.A. (Applied Economics - 5 Years)",
  "M.A. (Economics)",
  "M.A. (English)",
  "M.A. (Hindi)",
  "M.A. (Mass Communication)",
  "M.A. (Public Administration)",
  "M.A. (Telugu Studies)",
  "M.A. (Telugu Studies - Comparative Literature)",
  "M.A. (Urdu)",
  "M.A. (History)",
  "M.A. (Political Science)",
  "M.Com. (e-Commerce)",
  "M.Com. (General)",
  "M.S.W",
  "M.Sc. (Applied Statistics)",
  "M.Sc. (Bio-Technology)",
  "M.Sc. (Botany)",
  "M.Sc. (Chemistry - 2 Years Course in specialization with Organic Chemistry)",
  "M.Sc. (Chemistry - 2 Years with specialization in Pharmaceutical Chemistry)",
  "M.Sc. (Chemistry - 5 Years Integrated with specialization in Pharmaceutical Chemistry)",
  "M.Sc. (Computer Science)",
  "M.Sc. (Food Science & Technology)",
  "M.Sc. (Geo Informatics)",
  "M.Sc. (Mathematics)",
  "M.Sc. (Nutrition & Dietetics)",
  "M.Sc. (Physics)",
  "M.Sc. (Physics - 2 Years with specialization in Electronics)",
  "M.Sc. (Statistics)",
  "M.Sc. (Zoology)",
  "IMBA (Integrated Master of Business Management) (5 Yrs Integrated)",
  "M.B.A",
  "M.C.A",
  "LL.B (3 Years)",
  "LL.M (2 Years)",
  "B.Lib.Sc",
  "B.Ed.",
  "M.Ed.",
  "B.P.Ed.",
];

const departments = ["Accounts", "Hostel", "Sports", "Labs", "Library"];

const feeStructure: FeeStructure = {
  tuition: 40000,
  hostel: 33000,
  sports: 5000,
  labs: 8000,
  library: 2000,
  accounts: 3000,
};

// Seeded random number generator (mulberry32)
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const generateStudentData = (): StudentDataItem[] => {
  const data: StudentDataItem[] = [];
  const years = Array.from({ length: 17 }, (_, i) => 2008 + i);
  // Store unique student count per year and due student count per year
  const uniqueStudentsPerYear: Record<number, number> = {};
  const dueStudentsPerYear: Record<number, number> = {};
  // Use a fixed seed for reproducibility
  const rand = mulberry32(123456789);

  years.forEach((year) => {
    // 600-700 unique students per year
    const totalStudentsPerYear = Math.floor(rand() * 101) + 600;
    uniqueStudentsPerYear[year] = totalStudentsPerYear;

    // Calculate due percentage for this year
    let duePercent = 0.2; // default 20%
    if (year === 2024) duePercent = 1.0;
    else if (year === 2023) duePercent = 0.2;
    else if (year === 2022) duePercent = 0.18;
    else if (year === 2021) duePercent = 0.16;
    else if (year === 2020) duePercent = 0.14;
    else if (year === 2019) duePercent = 0.12;
    else if (year === 2018) duePercent = 0.1;
    else if (year === 2017) duePercent = 0.09;
    else if (year === 2016) duePercent = 0.08;
    else if (year === 2015) duePercent = 0.07;
    else if (year === 2014) duePercent = 0.06;
    else if (year === 2013) duePercent = 0.05;
    else if (year <= 2012) duePercent = 0.05;

    // Course distribution (weights add up to 1)
    const courseDistribution = [
      { course: "M.B.A", weight: 0.15 },
      { course: "M.Sc. (Computer Science)", weight: 0.12 },
      { course: "M.A. (Economics)", weight: 0.1 },
      { course: "M.Com. (General)", weight: 0.1 },
      {
        course:
          "M.Sc. (Chemistry - 2 Years Course in specialization with Organic Chemistry)",
        weight: 0.08,
      },
      { course: "M.Sc. (Physics)", weight: 0.08 },
      { course: "M.A. (English)", weight: 0.07 },
      { course: "M.Sc. (Mathematics)", weight: 0.07 },
      { course: "M.A. (Political Science)", weight: 0.06 },
      { course: "M.Sc. (Botany)", weight: 0.05 },
      { course: "M.Sc. (Zoology)", weight: 0.05 },
      { course: "M.A. (History)", weight: 0.04 },
      { course: "M.Sc. (Statistics)", weight: 0.03 },
    ];

    // Assign students to courses
    let students: {
      course: string;
      isHostel: boolean;
      isSCST: boolean;
      hasDue: boolean;
      dueAmount: number;
    }[] = [];
    let assigned = 0;
    courseDistribution.forEach(({ course, weight }, idx) => {
      // For last course, assign all remaining students to ensure total matches
      const count =
        idx === courseDistribution.length - 1
          ? totalStudentsPerYear - assigned
          : Math.round(totalStudentsPerYear * weight);
      assigned += count;
      for (let i = 0; i < count; i++) {
        // 75-80% opt for hostel
        const isHostel = rand() < rand() * 0.05 + 0.75;
        // 15-45% are SC/ST
        const isSCST = rand() < rand() * 0.3 + 0.15;
        students.push({
          course,
          isHostel,
          isSCST,
          hasDue: false,
          dueAmount: 0,
        });
      }
    });

    // Randomly select due students for this year
    const dueCount = Math.floor(totalStudentsPerYear * duePercent);
    dueStudentsPerYear[year] = dueCount;
    const dueIndices = new Set<number>();
    while (dueIndices.size < dueCount) {
      dueIndices.add(Math.floor(rand() * totalStudentsPerYear));
    }
    students.forEach((student, idx) => {
      if (dueIndices.has(idx)) {
        student.hasDue = true;
        student.dueAmount = Math.floor(rand() * 20001) + 50000; // ₹50,000–₹70,000
      }
    });

    // For each department, aggregate dues for all students
    departments.forEach((dept) => {
      let deptTotal = 0,
        deptCollected = 0,
        deptDues = 0,
        deptSCST = 0,
        deptGeneral = 0,
        deptStudents = 0;
      students.forEach((student) => {
        // Hostel dues only for hostel students
        if (dept === "Hostel" && !student.isHostel) return;
        deptStudents++;
        if (student.isSCST) deptSCST++;
        else deptGeneral++;
        let fee = 0;
        let collected = 0;
        if (student.hasDue) {
          // Distribute dueAmount across departments (evenly)
          const deptDue = student.dueAmount / departments.length;
          fee = deptDue;
          // For 2024, all students with dues are still pending; for previous years, most have paid
          let paid = 0;
          if (year === 2024) {
            paid = 0;
          } else {
            paid =
              rand() < 0.8
                ? deptDue
                : Math.floor(deptDue * (rand() * 0.2 + 0.7));
          }
          collected = paid;
        } else {
          fee = 0;
          collected = 0;
        }
        deptTotal += fee;
        deptCollected += collected;
        deptDues += fee - collected;
      });
      if (deptStudents > 0) {
        data.push({
          year,
          course: "All", // For summary, can be split if needed
          department: dept,
          studentsCount: deptStudents,
          scStStudents: deptSCST,
          generalStudents: deptGeneral,
          totalAmount: deptTotal,
          collectedAmount: deptCollected,
          duesAmount: deptDues,
          collectionPercentage:
            deptTotal > 0 ? (deptCollected / deptTotal) * 100 : 0,
        });
      }
    });
  });

  // Attach unique student count and due student count to the data array for summary use
  (data as any).uniqueStudentsPerYear = uniqueStudentsPerYear;
  (data as any).dueStudentsPerYear = dueStudentsPerYear;
  return data;
};

const StudentDuesDashboard = () => {
  const [selectedYear, setSelectedYear] = useState("2024");
  const [selectedDepartment, setSelectedDepartment] = useState("All");
  const [selectedCourse, setSelectedCourse] = useState("All");
  const [studentData] = useState<StudentDataItem[]>(generateStudentData());

  const years = Array.from({ length: 17 }, (_, i) => 2008 + i);

  const filteredData = useMemo(() => {
    return studentData.filter((item) => {
      const yearMatch =
        selectedYear === "All" || item.year.toString() === selectedYear;
      const deptMatch =
        selectedDepartment === "All" || item.department === selectedDepartment;
      const courseMatch =
        selectedCourse === "All" || item.course === selectedCourse;
      return yearMatch && deptMatch && courseMatch;
    });
  }, [studentData, selectedYear, selectedDepartment, selectedCourse]);

  // Fix: Use unique student count for summary
  const summaryStats = useMemo(() => {
    const totalAmount = filteredData.reduce(
      (sum, item) => sum + item.totalAmount,
      0
    );
    const collectedAmount = filteredData.reduce(
      (sum, item) => sum + item.collectedAmount,
      0
    );
    const duesAmount = filteredData.reduce(
      (sum, item) => sum + item.duesAmount,
      0
    );
    // Use unique student count for the selected year(s)
    let totalStudents = 0;
    let dueStudents = 0;
    if (selectedYear !== "All") {
      // @ts-ignore
      totalStudents =
        (studentData as any).uniqueStudentsPerYear?.[parseInt(selectedYear)] ||
        0;
      // @ts-ignore
      dueStudents =
        (studentData as any).dueStudentsPerYear?.[parseInt(selectedYear)] || 0;
    } else {
      // Sum unique students for all years
      // @ts-ignore
      totalStudents = Object.values(
        (studentData as any).uniqueStudentsPerYear || {}
      ).reduce((a, b) => (a as number) + (b as number), 0);
      // @ts-ignore
      dueStudents = Object.values(
        (studentData as any).dueStudentsPerYear || {}
      ).reduce((a, b) => (a as number) + (b as number), 0);
    }
    const duePercent =
      totalStudents > 0 ? (dueStudents / totalStudents) * 100 : 0;
    const collectionRate =
      totalAmount > 0 ? (collectedAmount / totalAmount) * 100 : 0;

    return {
      totalAmount,
      collectedAmount,
      duesAmount,
      totalStudents,
      dueStudents,
      duePercent,
      collectionRate,
    };
  }, [filteredData, selectedYear, studentData]);

  const departmentWiseData = useMemo((): DepartmentData[] => {
    const deptData = departments.map((dept) => {
      const deptItems = filteredData.filter((item) => item.department === dept);
      const totalAmount = deptItems.reduce(
        (sum, item) => sum + item.totalAmount,
        0
      );
      const collectedAmount = deptItems.reduce(
        (sum, item) => sum + item.collectedAmount,
        0
      );
      const duesAmount = deptItems.reduce(
        (sum, item) => sum + item.duesAmount,
        0
      );
      const studentsCount = deptItems.reduce(
        (sum, item) => sum + item.studentsCount,
        0
      );

      return {
        department: dept,
        totalAmount,
        collectedAmount,
        duesAmount,
        studentsCount,
        collectionRate:
          totalAmount > 0 ? (collectedAmount / totalAmount) * 100 : 0,
      };
    });

    return deptData;
  }, [filteredData]);

  const yearlyTrendData = useMemo((): YearlyTrendData[] => {
    const yearData = years.map((year) => {
      const yearItems = studentData.filter((item) => item.year === year);
      const totalAmount = yearItems.reduce(
        (sum, item) => sum + item.totalAmount,
        0
      );
      const collectedAmount = yearItems.reduce(
        (sum, item) => sum + item.collectedAmount,
        0
      );
      const duesAmount = yearItems.reduce(
        (sum, item) => sum + item.duesAmount,
        0
      );

      return {
        year,
        totalAmount: totalAmount / 1000000, // Convert to millions
        collectedAmount: collectedAmount / 1000000,
        duesAmount: duesAmount / 1000000,
        collectionRate:
          totalAmount > 0 ? (collectedAmount / totalAmount) * 100 : 0,
      };
    });

    return yearData;
  }, [studentData]);

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const colors = ["#1e40af", "#3b82f6", "#60a5fa", "#93c5fd", "#dbeafe"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col items-center gap-2 mb-6">
          <div className="flex flex-col items-center">
            <div className="flex flex-row items-center gap-4 mb-1">
              <img
                src="/assets/Telangana_University_logo.png"
                alt="Telangana University Logo"
                className="h-16 w-auto drop-shadow-lg"
                style={{
                  filter: "drop-shadow(0 4px 12px rgba(30, 64, 175, 0.15))",
                }}
              />
              <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-700 via-indigo-600 to-blue-400 tracking-tight">
                Telangana University
              </h1>
            </div>
            <p className="text-lg md:text-2xl text-slate-600 font-medium mb-2">
              Student Dues Management Dashboard
            </p>
            <div className="w-28 h-1 bg-gradient-to-r from-blue-600 to-indigo-600 mx-auto rounded-full mb-2"></div>
          </div>
        </div>

        {/* Filters */}
        <Card className="border-blue-200 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Filters & Controls
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Academic Year
                </label>
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger className="border-blue-300 focus:border-blue-500">
                    <SelectValue placeholder="Select Year" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Years</SelectItem>
                    {years.map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Department
                </label>
                <Select
                  value={selectedDepartment}
                  onValueChange={setSelectedDepartment}
                >
                  <SelectTrigger className="border-blue-300 focus:border-blue-500">
                    <SelectValue placeholder="Select Department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Departments</SelectItem>
                    {departments.map((dept) => (
                      <SelectItem key={dept} value={dept}>
                        {dept}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Course
                </label>
                <Select
                  value={selectedCourse}
                  onValueChange={setSelectedCourse}
                >
                  <SelectTrigger className="border-blue-300 focus:border-blue-500">
                    <SelectValue placeholder="Select Course" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    <SelectItem value="All">All Courses</SelectItem>
                    {courses.map((course) => (
                      <SelectItem key={course} value={course}>
                        {course}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <Card className="bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">
                    Total Students
                  </p>
                  <p className="text-3xl font-bold text-slate-800">
                    {summaryStats.totalStudents.toLocaleString()}
                  </p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Users className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">
                    Students with Dues
                  </p>
                  <p className="text-3xl font-bold text-slate-800">
                    {summaryStats.dueStudents.toLocaleString()}
                  </p>
                  <Badge className="mt-2 bg-yellow-100 text-yellow-800 border-0">
                    {summaryStats.duePercent.toFixed(1)}%
                  </Badge>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-xl flex items-center justify-center shadow-lg">
                  <AlertTriangle
                    className="w-7 h-7 text-white"
                    style={{ minWidth: 28, minHeight: 28 }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">
                    Total Amount
                  </p>
                  <p className="text-3xl font-bold text-slate-800">
                    {formatCurrency(summaryStats.totalAmount)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                  <IndianRupee className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">
                    Collected Amount
                  </p>
                  <p className="text-3xl font-bold text-slate-800">
                    {formatCurrency(summaryStats.collectedAmount)}
                  </p>
                  <Badge className="mt-2 bg-emerald-100 text-emerald-800 border-0">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    {summaryStats.collectionRate.toFixed(1)}%
                  </Badge>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center shadow-lg">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">
                    Dues Amount
                  </p>
                  <p className="text-3xl font-bold text-slate-800">
                    {formatCurrency(summaryStats.duesAmount)}
                  </p>
                  <Badge className="mt-2 bg-red-100 text-red-800 border-0">
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    {(100 - summaryStats.collectionRate).toFixed(1)}%
                  </Badge>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Clock className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Department-wise Analysis */}
        <div className="grid grid-cols-1 gap-6">
          <Card className="bg-white border-0 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-slate-800 to-slate-900 text-white">
              <CardTitle className="text-xl">
                Department-wise Collection Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={departmentWiseData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis
                    dataKey="department"
                    tick={{ fontSize: 12, fill: "#64748b" }}
                  />
                  <YAxis tick={{ fontSize: 12, fill: "#64748b" }} />
                  <Tooltip
                    formatter={(value: any, name: string) => [
                      name === "collectionRate"
                        ? `${Number(value).toFixed(1)}%`
                        : formatCurrency(Number(value)),
                      name === "collectedAmount"
                        ? "Collected"
                        : name === "duesAmount"
                        ? "Dues"
                        : "Collection Rate",
                    ]}
                    contentStyle={{
                      backgroundColor: "#f8fafc",
                      border: "1px solid #e2e8f0",
                      borderRadius: "8px",
                      boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
                    }}
                  />
                  <Bar
                    dataKey="collectedAmount"
                    fill="#3b82f6"
                    name="collectedAmount"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="duesAmount"
                    fill="#ef4444"
                    name="duesAmount"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Yearly Trends */}
        <Card className="bg-white border-0 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-slate-800 to-slate-900 text-white">
            <CardTitle className="text-xl">
              Yearly Collection Trends (in Millions)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={yearlyTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="year" tick={{ fill: "#64748b" }} />
                <YAxis tick={{ fill: "#64748b" }} />
                <Tooltip
                  formatter={(value: any, name: string) => [
                    name === "collectionRate"
                      ? `${Number(value).toFixed(1)}%`
                      : `₹${Number(value).toFixed(1)}M`,
                    name === "totalAmount"
                      ? "Total"
                      : name === "collectedAmount"
                      ? "Collected"
                      : name === "duesAmount"
                      ? "Dues"
                      : "Collection Rate",
                  ]}
                  contentStyle={{
                    backgroundColor: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="totalAmount"
                  stroke="#8b5cf6"
                  strokeWidth={3}
                  name="totalAmount"
                  dot={{ fill: "#8b5cf6", strokeWidth: 2, r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="collectedAmount"
                  stroke="#10b981"
                  strokeWidth={3}
                  name="collectedAmount"
                  dot={{ fill: "#10b981", strokeWidth: 2, r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="duesAmount"
                  stroke="#f59e0b"
                  strokeWidth={3}
                  name="duesAmount"
                  dot={{ fill: "#f59e0b", strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Department Details Table */}
        <Card className="border-green-200 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
            <CardTitle>Department-wise Detailed Summary</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-green-200">
                    <th className="text-left p-3 font-semibold text-gray-700">
                      Department
                    </th>
                    <th className="text-right p-3 font-semibold text-gray-700">
                      Students
                    </th>
                    <th className="text-right p-3 font-semibold text-gray-700">
                      Total Amount
                    </th>
                    <th className="text-right p-3 font-semibold text-gray-700">
                      Collected
                    </th>
                    <th className="text-right p-3 font-semibold text-gray-700">
                      Dues
                    </th>
                    <th className="text-right p-3 font-semibold text-gray-700">
                      Collection %
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {departmentWiseData.map((dept, index) => (
                    <tr
                      key={dept.department}
                      className={index % 2 === 0 ? "bg-green-50" : "bg-white"}
                    >
                      <td className="p-3 font-medium text-gray-800">
                        {dept.department}
                      </td>
                      <td className="p-3 text-right text-gray-700">
                        {dept.studentsCount.toLocaleString()}
                      </td>
                      <td className="p-3 text-right text-gray-700">
                        {formatCurrency(dept.totalAmount)}
                      </td>
                      <td className="p-3 text-right text-emerald-700 font-semibold">
                        {formatCurrency(dept.collectedAmount)}
                      </td>
                      <td className="p-3 text-right text-red-700 font-semibold">
                        {formatCurrency(dept.duesAmount)}
                      </td>
                      <td className="p-3 text-right">
                        <Badge
                          className={
                            dept.collectionRate >= 80
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }
                        >
                          {dept.collectionRate.toFixed(1)}%
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StudentDuesDashboard;
