"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";
import { CalendarIcon, Filter, Users, Clock, LogIn, LogOut } from "lucide-react";

interface User {
  id: number;
  name: string;
  email: string;
}

interface AttendanceEntry {
  userId: number;
  name: string;
  dept: string;
  time: string;
  date: string;
  type: "In" | "Out";
}

interface AttendancePageProps {
  users: User[]; // قائمة المستخدمين من Dashboard
}

export default function AttendancePage({ users = [] }: AttendancePageProps) {
  const { addToast } = useToast();

  // ================== STATE ==================
  const [selectedUserId, setSelectedUserId] = useState<number | "">("");
  const [department, setDepartment] = useState("");
  const [attendanceLog, setAttendanceLog] = useState<AttendanceEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [dateFilter, setDateFilter] = useState<string>("");

  // ================== HANDLERS ==================
  const handleAttendance = (type: "In" | "Out") => {
    if (!selectedUserId || !department) {
      addToast({
        title: "Validation Error",
        description: "يرجى ملء جميع الحقول",
        type: "error",
      });
      return;
    }

    setLoading(true);

    const user = users.find(u => u.id === selectedUserId);
    if (!user) return;

    const newEntry: AttendanceEntry = {
      userId: user.id,
      name: user.name,
      dept: department,
      time: new Date().toLocaleTimeString("ar-EG"),
      date: new Date().toLocaleDateString("en-US"),
      type,
    };

    setAttendanceLog(prev => [newEntry, ...prev]);
    addToast({
      title: type === "In" ? "Checked In" : "Checked Out",
      description:` تم تسجيل ${type === "In" ? "دخول" : "خروج"}  الموظف`,    
      type: "success",
    });

    setSelectedUserId("");
    setDepartment("");
    setLoading(false);
  };

  // Filter attendance by date
  const filteredAttendance = dateFilter 
    ? attendanceLog.filter(entry => entry.date === dateFilter)
    : attendanceLog;

  // ================== JSX ==================
  return (
    <div className="min-h-screen p-6 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white flex items-center space-x-2">
          <CalendarIcon className="w-6 h-6" />
          <span>Smart Attendance</span>
        </h1>

        {/* ====== FORM ====== */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 space-y-4">
          {/* اختيار الموظف */}
          <select
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(Number(e.target.value))}
            className="w-full p-2 border rounded dark:bg-gray-900"
          >
            <option value="">اختر الموظف</option>
            {users.map(user => (
              <option key={user.id} value={user.id}>{user.name}</option>
            ))}
          </select>

          <input
            type="text"
            placeholder="Department"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className="w-full p-2 border rounded dark:bg-gray-900"
          />

          <div className="flex space-x-2">
            <Button
              onClick={() => handleAttendance("In")}
              disabled={loading}
              className="flex-1"
            >
              Check In
            </Button>
            <Button
              onClick={() => handleAttendance("Out")}
              disabled={loading}
              className="flex-1"
              variant="destructive"
            >
              Check Out
            </Button>
          </div>
        </div>

        {/* ====== FILTER ====== */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 mb-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">فلتر حسب التاريخ:</label>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-3 py-1 border rounded dark:bg-gray-900 dark:border-gray-600 text-sm"
            />
            {dateFilter && (
              <Button
                onClick={() => setDateFilter("")}
                variant="outline"
                size="sm"
              >
                مسح الفلتر
              </Button>
            )}
          </div>
        </div>

        {/* ====== ATTENDANCE LOG ====== */}
        <div className="mt-6 overflow-x-auto bg-white dark:bg-gray-800 shadow rounded-lg">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-white">الموظف</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-white">القسم</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-white">التاريخ</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-white">الوقت</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-white">النوع</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredAttendance.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <div className="flex flex-col items-center gap-2">
                      <Users className="w-8 h-8 text-gray-400" />
                      <span>لا توجد سجلات {dateFilter ? "لهذا التاريخ" : "بعد"}</span>
                    </div>
                  </td>
                </tr>
              )}
              {filteredAttendance.map((entry, index) => (
                <tr key={index} className="hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{entry.name}</td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{entry.dept}</td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{entry.date}</td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {entry.time}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
                      entry.type === "In" 
                        ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" 
                        : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                    }`}>
                      {entry.type === "In" ? <LogIn className="w-3 h-3" /> : <LogOut className="w-3 h-3" />}
                      {entry.type === "In" ? "دخول" : "خروج"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}