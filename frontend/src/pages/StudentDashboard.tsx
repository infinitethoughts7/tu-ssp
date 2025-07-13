import React, { useEffect, useMemo, useState, useCallback } from "react";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Alert } from "../components/ui/alert";
import { useAuth } from "../context/useAuth";
import api from "../services/api";
import {
  LogOut,
  Book,
  Home,
  Library,
  FlaskConical,
  Dumbbell,
  User2,
  BadgeInfo,
  GraduationCap,
  Eye,
} from "lucide-react";

import { buttonColour } from "../types/constants";

const PRIMARY = buttonColour.primary;
const ICON_BG = {
  academic: "bg-blue-100 text-blue-700",
  hostel: "bg-yellow-100 text-yellow-700",
  library: "bg-green-100 text-green-700",
  legacy: "bg-purple-100 text-purple-700",
  sports: "bg-pink-100 text-pink-700",
};

export default function StudentDashboard() {
  const { user, logout, isLoading: authLoading } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [dues, setDues] = useState<Record<string, number>>({});
  const [records, setRecords] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);

  const username = user?.username || user?.user?.username;
  const name = useMemo(() => {
    if (!profile) return "";
    return (
      profile.user.first_name +
      (profile.user.last_name ? ` ${profile.user.last_name}` : "")
    );
  }, [profile]);

  // Fetch profile
  const fetchProfile = useCallback(async () => {
    const res = await api.get("/profile/");
    setProfile(res.data.profile);
  }, []);

  // Fetch all dues and records
  const fetchAllDues = useCallback(async () => {
    if (!username) return;
    setLoading(true);
    setError("");
    try {
      // Academic
      const academicRes = await api.get(
        `/dues/academic-records/?student_id=${username}`
      );
      const academicRecords = academicRes.data;
      const academicTotal = academicRecords.reduce(
        (sum: number, rec: any) => sum + (rec.due_amount || 0),
        0
      );

      // Hostel
      const hostelRes = await api.get(
        `/dues/hostel-records/?student_id=${username}`
      );
      const hostelRecords = hostelRes.data;
      const hostelTotal = hostelRecords.reduce(
        (sum: number, rec: any) => sum + (rec.mess_bill || 0),
        0
      );

      // Library
      const libraryRes = await api.get(
        `/dues/library-records/grouped_by_student/?student_id=${username}`
      );
      const libraryRecords =
        libraryRes.data.length > 0 ? libraryRes.data[0].records || [] : [];
      const libraryTotal =
        libraryRes.data.length > 0
          ? libraryRes.data[0].total_fine_amount || 0
          : 0;

      // Legacy Records - split between Academic and Department/Lab
      const legacyRes = await api.get(
        `/dues/legacy-academic-records/grouped_by_student/?student_username=${username}`
      );
      let legacyRecords: any[] = [];
      let academicLegacyTotal = 0;
      let departmentLabTotal = 0;

      if (legacyRes.data.length > 0) {
        const allLegacyRecords = legacyRes.data[0].dues || [];

        // Split legacy records between Academic and Department/Lab
        allLegacyRecords.forEach((d: any) => {
          const label = (
            d.label ||
            d.type ||
            d.description ||
            ""
          ).toLowerCase();

          if (label.includes("lab") || label.includes("department")) {
            legacyRecords.push(d);
            departmentLabTotal += d.due_amount || 0;
          } else {
            // All other legacy records go to Academic Dues
            academicLegacyTotal += d.due_amount || 0;
          }
        });
      }

      // Sports
      const sportsRes = await api.get(
        `/dues/sports-records/grouped_by_student/?student_id=${username}`
      );
      const sportsRecords =
        sportsRes.data.length > 0 ? sportsRes.data[0].records || [] : [];
      const sportsTotal =
        sportsRes.data.length > 0
          ? sportsRes.data[0].total_fine_amount || 0
          : 0;

      setDues({
        academic: academicTotal + academicLegacyTotal, // Include legacy academic dues
        hostel: hostelTotal,
        library: libraryTotal,
        legacy: departmentLabTotal, // Only department/lab legacy dues
        sports: sportsTotal,
      });
      setRecords({
        academic: academicRecords,
        hostel: hostelRecords,
        library: libraryRecords,
        legacy: legacyRecords,
        sports: sportsRecords,
      });
    } catch (e) {
      setError("Failed to fetch dues. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, [username]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  useEffect(() => {
    if (profile) fetchAllDues();
  }, [profile, fetchAllDues]);

  if (authLoading || loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white">
        <span className="animate-spin h-10 w-10 border-4 border-blue-500 rounded-full border-t-transparent"></span>
        <p className="mt-4 text-base font-medium text-gray-800">
          Loading dashboard...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="max-w-md mx-auto mt-10">
        {error}
      </Alert>
    );
  }

  // Helper for details rendering
  const renderDetails = (key: string) => {
    if (key === "library") {
      return (
        <div className="mt-2 text-xs md:text-sm">
          <div className="font-semibold mb-1">Library Records</div>
          <div className="overflow-x-auto">
            <table className="w-full border text-left">
              <thead>
                <tr className="bg-gray-50">
                  <th className="p-2">Book ID</th>
                  <th className="p-2">Borrowing Date</th>
                  <th className="p-2">Fine Amount</th>
                </tr>
              </thead>
              <tbody>
                {records.library.map((rec, i) => (
                  <tr key={i} className="border-t">
                    <td className="p-2">{rec.book_id}</td>
                    <td className="p-2">{rec.borrowing_date}</td>
                    <td className="p-2">₹{rec.fine_amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    }
    if (key === "sports") {
      return (
        <div className="mt-2 text-xs md:text-sm">
          <div className="font-semibold mb-1">Sports Records</div>
          <div className="overflow-x-auto">
            <table className="w-full border text-left">
              <thead>
                <tr className="bg-gray-50">
                  <th className="p-2">Equipment</th>
                  <th className="p-2">Borrowing Date</th>
                  <th className="p-2">Fine Amount</th>
                </tr>
              </thead>
              <tbody>
                {records.sports.map((rec, i) => (
                  <tr key={i} className="border-t">
                    <td className="p-2">{rec.equipment_name}</td>
                    <td className="p-2">{rec.borrowing_date}</td>
                    <td className="p-2">₹{rec.fine_amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    }
    if (key === "legacy") {
      return (
        <div className="mt-2 text-xs md:text-sm">
          <div className="font-semibold mb-1">Department/Lab Records</div>
          <div className="overflow-x-auto">
            <table className="w-full border text-left">
              <thead>
                <tr className="bg-gray-50">
                  <th className="p-2">Description</th>
                  <th className="p-2">Due Amount</th>
                </tr>
              </thead>
              <tbody>
                {records.legacy.map((rec, i) => (
                  <tr key={i} className="border-t">
                    <td className="p-2">
                      {rec.label || rec.type || rec.description || "-"}
                    </td>
                    <td className="p-2">₹{rec.due_amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-white px-1 py-3 flex flex-col items-center">
      {/* Header: Logo + Welcome */}
      <div className="flex flex-col md:flex-row items-center justify-center gap-4 mb-6 bg-white p-4 rounded-xl shadow-sm w-full max-w-3xl">
        <img
          src="/src/assets/Telangana_University_logo.png"
          alt="Telangana University Logo"
          className="w-14 h-14 md:w-16 md:h-16 drop-shadow-xl"
        />
        <div className="flex flex-col items-center md:items-start">
          <h1 className="text-2xl md:text-3xl font-extrabold mb-1 text-transparent bg-clip-text bg-gradient-to-r from-blue-700 via-indigo-600 to-blue-400">
            Welcome, {name || "Student"}!
          </h1>
          <p className="text-sm md:text-base text-gray-700 font-medium tracking-wide">
            Student Dashboard
          </p>
        </div>
        <Button
          variant="outline"
          className="md:ml-auto mt-4 md:mt-0 shadow-md text-sm px-3 py-1.5"
          onClick={logout}
        >
          <LogOut className="w-4 h-4 mr-2" /> Logout
        </Button>
      </div>
      {/* Profile Card - no title, compact, elegant */}
      <div className="flex justify-center mb-6 w-full">
        <Card className="w-full max-w-3xl shadow border-0 bg-white rounded-xl p-2">
          <CardContent className="py-4 px-3">
            <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 w-full text-sm md:text-base">
              {/* Left: Roll No & Course */}
              <div className="flex-1 min-w-[180px]">
                <div className="flex items-center gap-2 mb-1">
                  <BadgeInfo className="w-4 h-4 text-gray-400" />
                  <span className="font-semibold text-gray-900">Roll No:</span>
                  <span className="font-bold text-gray-900">
                    {profile?.user.username}
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <GraduationCap className="w-4 h-4 text-gray-400 mt-0.5" />
                  <div className="flex flex-col">
                    <span className="font-semibold text-gray-900">Course:</span>
                    <span className="text-gray-800 whitespace-pre-line">
                      {profile?.course_name}
                    </span>
                  </div>
                </div>
              </div>
              {/* Right: Batch & Caste */}
              <div className="flex-1 min-w-[140px] flex flex-col gap-2 md:items-end">
                <div className="flex items-center gap-2">
                  <Book className="w-4 h-4 text-gray-400" />
                  <span className="font-semibold text-gray-900">Batch:</span>
                  <span className="font-bold text-gray-900">
                    {profile?.batch}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <BadgeInfo className="w-4 h-4 text-gray-400" />
                  <span className="font-semibold text-gray-900">Caste:</span>
                  <span className="font-bold text-gray-900">
                    {profile?.caste}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      {/* Dues Cards - vertical alignment, compact, amount right, expandable details */}
      <div className="max-w-3xl w-full mx-auto flex flex-col gap-4">
        {[
          {
            key: "academic",
            label: "Academic Dues",
            icon: GraduationCap,
            iconBg: ICON_BG.academic,
            total: dues.academic,
            hasDetails: false,
          },
          {
            key: "hostel",
            label: "Hostel Dues",
            icon: Home,
            iconBg: ICON_BG.hostel,
            total: dues.hostel,
            hasDetails: false,
          },
          {
            key: "library",
            label: "Library Dues",
            icon: Library,
            iconBg: ICON_BG.library,
            total: dues.library,
            hasDetails: records.library && records.library.length > 0,
          },
          {
            key: "legacy",
            label: "Department/Lab Dues",
            icon: FlaskConical,
            iconBg: ICON_BG.legacy,
            total: dues.legacy,
            hasDetails: records.legacy && records.legacy.length > 0,
          },
          {
            key: "sports",
            label: "Sports Dues",
            icon: Dumbbell,
            iconBg: ICON_BG.sports,
            total: dues.sports,
            hasDetails: records.sports && records.sports.length > 0,
          },
        ].map((d) => {
          const Icon = d.icon;
          return (
            <Card
              key={d.key}
              className="shadow border-0 bg-white rounded-xl flex flex-row items-center justify-between px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <span
                  className={`inline-flex items-center justify-center rounded-full w-9 h-9 ${d.iconBg}`}
                >
                  <Icon className="w-5 h-5" />
                </span>
                <span className="font-semibold text-gray-900 text-base md:text-lg">
                  {d.label}
                </span>
                {d.hasDetails && (
                  <button
                    className="ml-2 text-xs text-blue-600 underline flex items-center gap-1"
                    onClick={() =>
                      setExpanded(expanded === d.key ? null : d.key)
                    }
                  >
                    <Eye className="w-4 h-4 inline" />{" "}
                    {expanded === d.key ? "Hide" : "View Details"}
                  </button>
                )}
              </div>
              <div className="text-xl md:text-2xl font-bold text-gray-900 min-w-[80px] text-right">
                ₹{d.total?.toLocaleString() || 0}
              </div>
              {/* Details section */}
              {expanded === d.key && (
                <div className="absolute left-0 top-full w-full z-10 bg-white border rounded-b-xl shadow-lg mt-2 p-4">
                  {renderDetails(d.key)}
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
