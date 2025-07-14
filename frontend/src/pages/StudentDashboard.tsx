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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";

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

  const username = profile?.user?.username || "Not Found";
  const name = useMemo(() => {
    if (!profile?.user) return "";
    return (
      profile.user.first_name +
      (profile.user.last_name ? ` ${profile.user.last_name}` : "")
    );
  }, [profile]);

  // Fetch profile
  const fetchProfile = useCallback(async () => {
    try {
      const res = await api.get("/profile/");
      setProfile(res.data.profile);
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
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
      if (!records.library || records.library.length === 0) {
        return (
          <div className="flex flex-col items-center justify-center py-8">
            <span className="text-2xl font-semibold text-emerald-600 mb-2 font-sans">
              You have no dues!{" "}
              <span className="align-middle text-2xl">😄</span>
            </span>
            <span className="text-base text-gray-500 font-medium">
              Enjoy your freedom!
            </span>
          </div>
        );
      }
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
      if (!records.sports || records.sports.length === 0) {
        return (
          <div className="flex flex-col items-center justify-center py-8">
            <span className="text-2xl font-semibold text-emerald-600 mb-2 font-sans">
              You have no dues!{" "}
              <span className="align-middle text-2xl">😄</span>
            </span>
            <span className="text-base text-gray-500 font-medium">
              Enjoy your freedom!
            </span>
          </div>
        );
      }
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
      if (!records.legacy || records.legacy.length === 0) {
        return (
          <div className="flex flex-col items-center justify-center py-8">
            <span className="text-2xl font-semibold text-emerald-600 mb-2 font-sans">
              You have no dues!{" "}
              <span className="align-middle text-2xl">😄</span>
            </span>
            <span className="text-base text-gray-500 font-medium">
              Enjoy your freedom!
            </span>
          </div>
        );
      }
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
    <div
      className="min-h-screen px-1 py-3 flex flex-col items-center"
      style={{
        backgroundColor: "#f8fafc",
        backgroundImage:
          "linear-gradient(0deg, rgba(0,0,0,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.03) 1px, transparent 1px)",
        backgroundSize: "32px 32px",
      }}
    >
      {/* Modern Profile Card */}
      <div className="w-full max-w-3xl mx-auto flex flex-col items-center gap-4 bg-gradient-to-br from-blue-600 via-indigo-500 to-purple-500 rounded-2xl shadow-lg p-6 mb-8 relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-center gap-6 w-full">
          {/* Student Vector Icon */}
          <div className="flex-shrink-0 flex items-center justify-center w-28 h-28 md:w-32 md:h-32 rounded-full bg-white/20 shadow-md overflow-hidden border-4 border-white/30">
            <User2 className="w-20 h-20 md:w-24 md:h-24 text-white/90" />
          </div>
          {/* Profile Info */}
          <div className="flex-1 flex flex-col justify-center items-center md:items-start text-center md:text-left">
            {/* Vertically stacked Roll No and Name, center on mobile, left on desktop */}
            <div className="flex flex-col items-center md:items-start w-full mb-1">
              <span className="text-base md:text-lg font-bold text-white drop-shadow tracking-wide mb-0.5">
                Roll No: {profile?.user?.username || "-"}
              </span>
              <span className="text-xl md:text-2xl font-extrabold text-white drop-shadow">
                Hello, {name || "Student"}
              </span>
            </div>
            <div className="text-base md:text-lg text-white font-medium mb-2 drop-shadow">
              {profile?.course_name}
            </div>
            <div className="flex flex-wrap gap-x-6 gap-y-1 justify-center md:justify-start text-sm text-white/90">
              <span>
                <span className="font-semibold">Batch:</span> {profile?.batch}
              </span>
              <span>
                <span className="font-semibold">Caste:</span> {profile?.caste}
              </span>
            </div>
          </div>
        </div>
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
            hasDetails: true, // Always allow dialog for library
          },
          {
            key: "legacy",
            label: "Department/Lab Dues",
            icon: FlaskConical,
            iconBg: ICON_BG.legacy,
            total: dues.legacy,
            hasDetails: true, // Always allow dialog for department/lab
          },
          {
            key: "sports",
            label: "Sports Dues",
            icon: Dumbbell,
            iconBg: ICON_BG.sports,
            total: dues.sports,
            hasDetails: true, // Always allow dialog for sports
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
              </div>
              <div className="flex items-center gap-2 min-w-[100px] justify-end">
                {d.hasDetails && (
                  <Dialog>
                    <DialogTrigger asChild>
                      <button
                        className="p-1 focus:outline-none"
                        aria-label={`View ${d.label} details`}
                      >
                        <Eye className="w-5 h-5 text-blue-600" />
                      </button>
                    </DialogTrigger>
                    <DialogContent className="w-full max-w-xs sm:max-w-md md:max-w-2xl overflow-x-auto">
                      <DialogHeader>
                        <DialogTitle>{d.label} Details</DialogTitle>
                      </DialogHeader>
                      {renderDetails(d.key)}
                    </DialogContent>
                  </Dialog>
                )}
                <span className="text-xl md:text-2xl font-bold text-gray-900 text-right">
                  ₹{d.total?.toLocaleString() || 0}
                </span>
              </div>
            </Card>
          );
        })}
      </div>
      {/* Place logout button at the bottom of the dashboard */}
      <div className="w-full flex justify-center mt-8 mb-4">
        <Button
          className="shadow-md text-base px-6 py-2 w-full max-w-xs bg-red-100 text-red-700 hover:bg-red-600 hover:text-white active:bg-red-700 active:text-white transition-colors duration-150"
          onClick={logout}
        >
          <LogOut className="w-5 h-5 mr-2" /> Logout
        </Button>
      </div>
    </div>
  );
}
